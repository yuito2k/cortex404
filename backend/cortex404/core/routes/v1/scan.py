import json
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, File, UploadFile


async def _fetch_sheet(app, sheet_code: str) -> dict:
    """Fetch a sheet from the database by its code."""
    row = await app.db.dictionary(
        "SELECT * FROM omr_sheets WHERE sheet_code = $1",
        sheet_code,
    )
    
    if not row:
        raise HTTPException(404, f"Sheet '{sheet_code}' not found.")
    return row


async def _persist_result(app, sheet_code: str, result: dict) -> None:
    """Persist the scan result to the database."""
    now = datetime.now(timezone.utc)
    detected = [r["selected_opt"] for r in result["question_results"]]

    await app.db.execute(
        "UPDATE omr_sheets SET "
        "status = $1, "
        "detected_answers = $2, "
        "raw_detection = $3, "
        "score = $4, "
        "total = $5, "
        "correct_count = $6, "
        "wrong_count = $7, "
        "skipped_count = $8, "
        "flagged_count = $9, "
        "graded_at = $10, "
        "submitted_at = $11 "
        "WHERE sheet_code = $12",
        "flagged" if result["needs_review"] else "graded",
        json.dumps(detected),
        json.dumps(result["question_results"]),
        result["score"],
        result["correct_count"],
        result["wrong_count"],
        result["skipped_count"],
        result.get("flagged_count", 0),
        now,
        now,
        sheet_code,
    )


def _quick_qr(image_bytes: bytes) -> Optional[str]:
    import numpy as np
    from pyzbar import pyzbar as pz
    arr = np.frombuffer(image_bytes, np.uint8)
    import cv2
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    for obj in pz.decode(img):
        if obj.type == "QRCODE":
            return obj.data.decode().strip()
    return None

class Scan:
    def __init__(self, app):
        self.app = app
        self.router = APIRouter(
            prefix="/api/v1/omr",
            tags=["scan on v1"]
        )

        self.add_routes()

    def add_routes(self):
        self.add_get_routes()
        self.add_post_routes()
        self.add_put_routes()
        self.add_delete_routes()

    def add_get_routes(self):
        ...

    def add_post_routes(self):
        @self.router.post("/scan", response_model=self.app.models.ScanResult)
        async def scan_sheet(image: UploadFile = File(...)):
            """Upload a filled OMR sheet photo → instant graded result."""
            image_bytes = await image.read()
            if not image_bytes:
                raise HTTPException(400, "Empty file upload.")

            sheet_code = _quick_qr(image_bytes)
            if not sheet_code:
                try:
                    img     = self.app.utils.detector.load_image(image_bytes)
                    binary  = self.app.utils.detector.preprocess(img)
                    anchors = self.app.utils.detector.find_anchors(binary)
                    warped  = self.app.utils.detector.dewarp(img, anchors)
                    sheet_code = self.app.utils.detector.decode_qr(warped)
                except ValueError:
                    pass
                
            if not sheet_code:
                raise HTTPException(
                    422,
                    "Could not read sheet code from this photo. "
                    "Make sure both QR codes are visible and the sheet is well-lit."
                )

            sheet = await _fetch_sheet(self.app, sheet_code)

            if sheet["status"] in ("graded", "flagged"):
                raise HTTPException(
                    409,
                    f"Sheet '{sheet_code}' was already graded on {sheet.get('graded_at')}."
                )

            manifest = json.loads(sheet['manifest'])
            bubble_coords = manifest['bubble_coords']

            manifest     = {"sheet_code": sheet_code, "bubble_coords": bubble_coords}
            answer_key   = sheet["correct_answer_keys"]
            question_ids = sheet["question_ids"]

            try:
                result = self.app.utils.detector.process_sheet(image_bytes, manifest, answer_key, question_ids)
            except ValueError as exc:
                raise HTTPException(422, str(exc))

            await _persist_result(self.app, sheet_code, result)

            # Update photo URL if stored (optional — upload from Nuxt)
            return result

    def add_put_routes(self):
        ...

    def add_delete_routes(self):
        ...