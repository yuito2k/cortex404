import os
import tempfile
from fastapi import APIRouter, HTTPException, status

class Generate:
    def __init__(self, app):
        self.app = app
        self.router = APIRouter(
            prefix="/api/v1/generate",
            tags=["generate on v1"]
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
        @self.router.post("/generate", response_model=self.app.models.GenerateResponse)
        async def generate_sheet(req: self.app.models.GenerateRequest):
            """
            Generate a per-student OMR answer sheet PDF.

            Flow
            ────
            1. Validate: max 25 questions, all options present
            2. Generate a unique sheet_code
            3. Render PDF + bubble-coord manifest via omr_template_generator
            4. Upload PDF to Supabase Storage  (omr-sheets/{user_id}/{sheet_code}.pdf)
            5. Insert omr_sheets row with manifest + answer key locked in
            6. Return signed URL (1 hour) for browser preview

            Called by the Nuxt server route — never directly from the browser.
            """
            #from omr_template_generator import generate_sheet as _gen

            # ── Validate ──────────────────────────────────────────────────────────
            if not req.questions:
                raise HTTPException(400, "questions list is empty.")
            if len(req.questions) > 25:
                raise HTTPException(400, f"Maximum 25 questions per sheet (got {len(req.questions)}).")
            for q in req.questions:
                if len(q.options) != 4:
                    raise HTTPException(400, f"Question {q.id} must have exactly 4 options.")
                if not (0 <= q.correct_index <= 3):
                    raise HTTPException(400, f"Question {q.id} correct_index must be 0–3.")

            # ── Generate PDF ──────────────────────────────────────────────────────
            sheet_code   = self.app.generate_id()
            question_ids = [q.id for q in req.questions]
            answer_key   = [q.correct_index for q in req.questions]
            questions_fmt = [(i+1, q.question, q.options) for i, q in enumerate(req.questions)]

            with tempfile.TemporaryDirectory() as tmp:
                pdf_path = os.path.join(tmp, f"{sheet_code}.pdf")
                manifest = self.app.utils.omr_template_generator.generate_sheet(
                    filename      = pdf_path,
                    sheet_code    = sheet_code,
                    student_name  = req.student_name,
                    student_id    = req.student_id,
                    exam_title    = req.exam_id,
                    questions     = questions_fmt,
                )

                # ── Upload to Supabase Storage ─────────────────────────────────────
                storage_path = f"exam/{req.exam_id}/{sheet_code}.pdf"
                with open(pdf_path, "rb") as f:
                    pdf_bytes = f.read()

                sb = self.app.supabase
                sb.storage.from_("omr-sheets").upload(
                    path         = storage_path,
                    file         = pdf_bytes,
                    file_options = {"content-type": "application/pdf", "upsert": "true"},
                )

                # ── Get signed URL (1 hour) ────────────────────────────────────────
                signed = sb.storage.from_("omr-sheets").create_signed_url(
                    path       = storage_path,
                    expires_in = 3600,
                )
                signed_url = signed["signedURL"]
                pdf_url    = f"{self.app.config.SUPABASE_URL}/storage/v1/object/public/omr-sheets/{storage_path}"

                # ── Insert omr_sheets row ──────────────────────────────────────────
                #row = {
                #    "sheet_code":         sheet_code,
                #    "created_by":            req.student_id,
                #    #"bubble_coords":      manifest["bubble_coords"],
                #    "pdf_url":            pdf_url,
                #}

                await self.app.db.execute(
                    "INSERT INTO omr_sheets (sheet_code, preset_exam_id, created_by, pdf_url) VALUES ($1, $2, $3, $4)",
                    sheet_code,
                    req.exam_id,
                    req.student_id,
                    pdf_url,
                )

                if req.template_id:
                    #row["template_id"] = req.template_id
                    await self.app.db.execute(
                        "INSERT INTO omr_sheets (sheet_code, preset_exam_id, created_by, pdf_url, template_id) VALUES ($1, $2, $3, $4, %5)",
                        sheet_code,
                        req.exam_id,
                        req.student_id,
                        pdf_url,
                        req.template_id,
                    )

                #sb.table("omr_sheets").insert(row).execute()

            return self.app.models.GenerateResponse(
                sheet_code = sheet_code,
                pdf_url    = pdf_url,
                signed_url = signed_url,
            )

    def add_put_routes(self):
        ...

    def add_delete_routes(self):
        ...