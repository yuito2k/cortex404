create table if not exists public.omr_sheets (
  id                uuid primary key default uuid_generate_v4(),
  preset_exam_id  uuid references public.preset_exams(id) on delete cascade,
  --model_test_id  uuid references public.model_tests(id) on delete cascade,

  sheet_code text not null,
  pdf_url text not null,
  template_id text null,

  -- Audit
  created_by        uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now()
);
