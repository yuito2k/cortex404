from typing import Optional, Any
from pydantic import BaseModel
from tortoise import fields, Model
from datetime import datetime, timezone
from tortoise.contrib.pydantic import pydantic_model_creator


class Question(BaseModel):
    id:      int
    question:    str
    options: list[str]          # [opt_A, opt_B, opt_C, opt_D]
    correct_index: int          # 0-indexed (0=A, 1=B, 2=C, 3=D)


class GenerateRequest(BaseModel):
    student_id:   str           # your internal student ID, printed on sheet
    student_name: str
    exam_id:   str
    questions:    list[Any]
    template_id:  Optional[str] = None


class GenerateResponse(BaseModel):
    sheet_code:  str
    pdf_url:     str            # permanent Supabase Storage path
    signed_url:  str            # 1-hour signed URL for browser preview


class QuestionResult(BaseModel):
    qno:          int
    question_id:  int
    correct_opt:  str
    selected_opt: Optional[str]
    fill_ratios:  dict[str, float]
    outcome:      str
    confidence:   float


class ScanResult(BaseModel):
    sheet_code:       str
    score:            int
    total:            int
    correct_count:    int
    wrong_count:      int
    skipped_count:    int
    flagged_count:    int
    percentage:       float
    needs_review:     bool
    question_results: list[QuestionResult]


class User(Model):
    uuid = fields.BigIntField(primary_key=True, index=True)
    user_name = fields.CharField(max_length=60, null=False)
    full_name = fields.CharField(max_length=100, null=False)
    email = fields.CharField(max_length=300, null=False, unique=True)
    pass_key = fields.CharField(max_length=20, null=False, unique=False)
    is_verified = fields.BooleanField(default=False)
    phone_number = fields.CharField(max_length=30, null=False, unique=True)
    joined_at = fields.DatetimeField(default=datetime.now(timezone.utc))


pydantic_user = pydantic_model_creator(User, name="User", exclude=("is_verified",))
pydantic_userIn = pydantic_model_creator(User, name="UserIn", exclude_readonly=True, exclude=("is_verified", "joined_at",))
pydantic_userOut = pydantic_model_creator(User, name="UserOut", exclude=("pass_key",))