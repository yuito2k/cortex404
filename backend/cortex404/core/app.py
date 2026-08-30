import time

import uvicorn
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pytz import utc
from functools import lru_cache
from tortoise.contrib.fastapi import register_tortoise

from cortex404 import Config, models, utils
from cortex404.db import Database

from .routes.v1 import *


@lru_cache(maxsize=1)
def _supabase():
    from supabase import create_client
    url = Config.SUPABASE_URL
    key = Config.SUPABASE_SERVICE_KEY
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set.")
    return create_client(url, key)



class ApiServer:
    def __init__(self, directory):
        # Step 1: Instantiate the FastAPI object
        self.app = FastAPI(title="Cortex404 API", version="1.0.0")
        self.directory = directory
        self.app.mount(
            "/static",
            StaticFiles(directory=str(self.directory / "static")),
            name="static",
        )

        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_methods=["POST", "GET"],
            allow_headers=["*"],
        )

        self.utils = utils
        self.config = Config
        self.models = models
        self.templates = "./cortex404/templates"
        self._dynamic = "./cortex404/data/dynamic"
        self._static = "./cortex404/data/static"

        self.scheduler = AsyncIOScheduler()
        self.scheduler.configure(timezone=utc)
        self.db = Database(self)
        self.supabase = _supabase()

        # Add routes (can be done with decorators on class methods)
        self.include_routers()
        self.add_routes()

    @staticmethod
    def generate_id():
        return "CX4-" + hex(int(time.time() * 1e7))[2:]

    def include_routers(self):
        user_router = Generate(self).router
        self.app.include_router(user_router)

    def add_routes(self):
        @self.app.on_event("startup")
        async def startup():
            print("Connecting to Database...")
            await self.db.connect()
            print("Connected to database.")

            # self.scheduler.start()
            # print(f"Scheduler started ({len(self.scheduler.get_jobs()):,} job(s)).")

        @self.app.on_event("shutdown")
        async def shutdown():
            print("Closing database...")
            await self.db.close()
            print("Closed database connection.")

        @self.app.get("/")
        async def read_root():
            return {"Hello": "World", "api_version": self.app.version}

        @self.app.get("/api/items/{item_id}")
        async def read_item(item_id: int):
            x = await self.db.field(f"SELECT {item_id};")
            return {"item_id": item_id, "db_calls": self.db._calls, "db_response": x}

    def run(self, host="0.0.0.0", port=8000, reload=False):
        """
        Step 3: Run the FastAPI app using uvicorn programmatically.
        When using reload=True, uvicorn needs the app object in the
        "module:attribute" format (e.g., "main:server.app").
        """

        if reload:
            register_tortoise(
                self.app,
                db_url=f"sqlite://{self.directory}/data/dynamic/database.sqlite3",
                modules={"models": ["cortex404.models.models"]},
                generate_schemas=True,
                add_exception_handlers=True,
            )

            uvicorn.run(
                "backend.core.app:server.app",  # Reference the global instance
                host=host,
                port=port,
                reload=reload,
            )
        else:
            register_tortoise(
                self.app,
                db_url=f"sqlite://{self.directory}/data/dynamic/database.sqlite3",
                modules={"models": ["cortex404.models.models"]},
                generate_schemas=True,
                add_exception_handlers=True,
            )

            # For production or without reload, you can pass the app instance directly
            uvicorn.run(self.app, host=host, port=port)
