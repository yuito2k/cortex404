-- ============================================================
-- CORTEX404 — Supabase Schema (Complete)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Enable UUID extension ───────────────────────────────────
create extension if not exists "uuid-ossp";


-- ============================================================
-- SECTION 1: USER PROFILES & SETTINGS
-- ============================================================

-- ── Profiles ────────────────────────────────────────────────
-- Extended from settings.vue: adds display_name, bio, stream,
-- institution, district, theme, exam_prefs, notif_prefs.
-- Also covers admin panel (index.vue): role and status fields.
create table if not exists public.profiles (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,

  -- Basic identity
  full_name        text,
  display_name     text,                          -- short/nickname shown in UI
  avatar_url       text,
  bio              text check (char_length(bio) <= 200),

  -- Admin panel fields (index.vue Users tab)
  role             text not null default 'user'     check (role   in ('user','moderator','admin')),
  status           text not null default 'unverified'   check (status in ('verified','banned','unverified')),

  -- Academic context (settings.vue profile tab)
  primary_stream   text default 'HSC Science',            -- HSC | SSC | BUET | Medical | BCS | Bank
  institution      text,                          -- school / college name
  district         text,                          -- Bangladesh district
  heard_from       text,                          -- how user heard about cortex404
  onboarding_completed boolean not null default false, -- whether user has completed onboarding

  -- Appearance preference
  --theme            text not null default 'dark',  -- dark | light | system

  -- Exam preferences stored as JSONB (settings.vue exam tab)
  -- Shape: { stream, questionCount, duration, difficulty, shuffle,
  --          negativeMarking, qbPageSize, autoExpand }
  exam_prefs       jsonb not null default '{
    "stream":          "HSC Science",
    "questionCount":   30,
    "duration":        30,
    "difficulty":      "balanced",
    "shuffle":         true,
    "negativeMarking": false,
    "qbPageSize":      10,
    "autoExpand":      false
  }'::jsonb,

  -- Notification preferences stored as JSONB (settings.vue notifications tab)
  -- Shape: { dailyReminder, reminderTime, leaderboard, streakReminder,
  --          examUpdates, newContent }
  notification_prefs      jsonb not null default '{
    "dailyReminder":   true,
    "reminderTime":    "08:00 AM",
    "leaderboard":     true,
    "streakReminder":  true,
    "examUpdates":     true,
    "newContent":      false
  }'::jsonb,

  -- Streak tracking (index.vue, progress.vue)
  streak           int not null default 0,
  longest_streak   int not null default 0,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique(user_id)
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- SECTION 2: QUESTIONS
-- ============================================================
-- Design decision: ONE shared questions table.
--
-- Rationale: All exam types (HSC, SSC, BUET, Medical, BCS, Bank, DU, etc.)
-- share the identical bilingual structure used in mock-exam.vue and
-- question-bank.vue — { english, bangla } for question, options,
-- explanation, subject, chapter, difficulty, and year. Splitting into
-- separate tables per language or per exam type would duplicate indexes,
-- complicate joins, and make cross-stream features (question-bank.vue
-- filters, mock-exam.vue multi-stream setup) harder. A single table with
-- an `exam` column and JSONB bilingual fields handles everything cleanly.
-- ──────────────────────────────────────────────────────────────────────

create table if not exists public.questions (
  id                bigserial primary key,

  -- Stream / exam classifier
  -- Values seen across all files: HSC, SSC, BUET, Medical, BCS, Bank,
  -- DU (Dhaka Univ), RU (Rajshahi Univ), CU, JU, IU, SUST, KUET, etc.
  exam              text not null,
  text_book         text,

  -- Bilingual text fields (JSONB with { "english": "...", "bangla": "..." })
  -- Null bangla is allowed for purely English content (e.g. English grammar Qs)
  question          jsonb,            -- { english, bangla }
  question_hash     text,             -- hash of the question text
  question_image    text,             -- image for the question if any
  stimulus          jsonb,            -- { english, bangla }
  stimulus_hash     text,             -- hash of the stimuli text
  stimulus_image    text,             -- image for the stimuli if any
  options           jsonb not null,   -- { english: [...], bangla: [...] }
  explanation       jsonb,            -- { english, bangla }
  subject           jsonb not null,   -- { english, bangla }
  chapter           jsonb not null,   -- { english, bangla }
  difficulty        jsonb not null,   -- { english: "hard", bangla: "কঠিন" }
  years             jsonb,            -- { english: ["2023", "2024"], bangla: ["২০২৩", "২০২৪"] }

  -- Scalar fields
  correct_index     smallint not null check (correct_index between 0 and 4),
  difficulty_level  text not null default 'medium' check (difficulty_level in ('easy','medium','hard')),

  -- Optional metadata
  source            jsonb,             -- e.g. "BUET 2023 Question Paper"
  --has_image         boolean not null default false,
  --image_url         text,             -- image for the question if any
  --tags              text[],           -- freeform tags for cross-topic search
  is_verified       boolean not null default false,

  -- Admin panel status (index.vue Questions tab)
  -- 'published' = live for all users
  -- 'draft'     = saved but not visible to students
  -- 'flagged'   = reported/under review (maps to question_reports)
  status            text not null default 'published'
                      check (status in ('published','draft','flagged')),

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Indexes for the filter patterns used in question-bank.vue and mock-exam.vue
create index if not exists idx_questions_exam             on public.questions(exam);
create index if not exists idx_questions_difficulty_level on public.questions(difficulty_level);
create index if not exists idx_questions_status           on public.questions(status);
create index if not exists idx_questions_published        on public.questions(status) where status = 'published';  -- TODO: is this even necessary
-- GIN indexes for JSONB subject/chapter text search
create index if not exists idx_questions_subject_gin      on public.questions using gin(subject);
create index if not exists idx_questions_chapter_gin      on public.questions using gin(chapter);
--create index if not exists idx_questions_tags             on public.questions using gin(tags);


CREATE OR REPLACE FUNCTION get_random_questions(
  p_exam text,
  p_subject text DEFAULT NULL,
  p_chapter text DEFAULT NULL,
  p_difficulty text DEFAULT NULL,
  p_limit int DEFAULT 100
)
RETURNS SETOF questions AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM questions
  WHERE status = 'published'
    AND exam = p_exam
    AND (p_subject IS NULL OR subject->>'english' = p_subject)
    AND (p_chapter IS NULL OR chapter->>'english' = p_chapter)
    -- AND (p_difficulty IS NULL OR difficulty_level = p_difficulty)
  ORDER BY random()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- SECTION 3: USER QUESTION INTERACTIONS
-- ============================================================

-- ── Bookmarks ────────────────────────────────────────────────
-- Used in question-bank.vue (bookmarkedIds) and leaderboard sidebar
create table if not exists public.bookmarks (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  question_id  bigint not null references public.questions(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique(user_id, question_id)
);

create index if not exists idx_bookmarks_user on public.bookmarks(user_id);

-- ── Exam Sessions ────────────────────────────────────────────
-- A single completed exam run (mock-exam.vue, admission-exam.vue,
-- engineering-exam.vue, hsc-ssc-exam.vue). One row per attempt.
create table if not exists public.exam_sessions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,

  -- Classification (mirrors mock-exam.vue config)
  exam_type           text not null,  -- 'mock' | 'admission' | 'engineering' | 'hsc_ssc' | 'practice'
  stream              text not null,                 -- HSC | SSC | BUET | Medical | BCS | Bank | DU | RU …
  subject             jsonb not null,
  chapter             jsonb not null,
  unit                text,                          -- DU/engineering unit (Ka, Kha, etc.)
  diff_mode           text not null, -- balanced | easy | hard | mixed

  -- hsc-ssc-exam.vue has a two-phase format (MCQ + written)
  has_written_section boolean not null default false,
  -- written answers stored as JSONB: { "w-hs-1": "student answer text", ... }
  written_answers     jsonb,

  -- Config snapshot
  questions_count     int not null default 0,
  duration_mins       int,                           -- configured duration
  shuffle             boolean not null default false,
  negative_marking    boolean not null default false,

  -- Results
  correct_count       int not null default 0,
  wrong_count         int not null default 0,
  skipped_count       int not null default 0,
  score               int not null default 0,        -- 0–100 percentage
  marks_earned        numeric(6,2) not null default 0, -- actual marks (with −0.25 deduction)
  duration_taken_mins int,                           -- how long they actually spent

  -- Per-subject breakdown (admission/engineering exams) — JSONB
  -- e.g. { "physics": { "correct": 22, "wrong": 3, "score": 73 }, ... }
  subject_breakdown   jsonb,

  -- Question IDs used in this session (preserves original order + shuffle)
  question_ids        bigint[],
  started_at       timestamptz not null default now(),
  submitted_at     timestamptz not null default now(),
  completed_at        timestamptz not null default now()
);

create index if not exists idx_sessions_user    on public.exam_sessions(user_id);
create index if not exists idx_sessions_stream  on public.exam_sessions(stream);
create index if not exists idx_sessions_chapter on public.exam_sessions(chapter);
create index if not exists idx_sessions_subject on public.exam_sessions(subject);
create index if not exists idx_sessions_created on public.exam_sessions(completed_at desc);

-- ── Solved / Attempted Questions ─────────────────────────────
-- Used in question-bank.vue (solvedIds). Tracks per-question attempts
-- so "✓ Solved" badge shows correctly and mastery can be computed.
create table if not exists public.question_attempts (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  -- question_id     bigint not null references public.questions(id) on delete cascade,
  question_id     bigint not null, -- removed the relation for multi db
  selected_index  smallint,                        -- null = skipped
  is_correct      boolean,                         -- null = skipped
  correct_index   smallint not null,               -- correct index of the question
  time_spent_m    int,                             -- time spent on the question in minutes
  source_type     text not null check (source_type in ('qbank','mock','practice', 'hsc', 'ssc','admission','engineering','bcs','buet','medical','du','ru','cu','ju','iu','sust','kuet')),   -- 'qbank' | 'mock' | 'practice' | 'admission'
  source_id       uuid references public.exam_sessions(id) on delete cascade,  -- foreign key to exam_sessions if applicable
  created_at      timestamptz not null default now()
);

create index if not exists idx_attempts_user     on public.question_attempts(user_id);
create index if not exists idx_attempts_question on public.question_attempts(question_id);
create index if not exists idx_attempts_source   on public.question_attempts(source_type, source_id);

-- ── Question Reports ─────────────────────────────────────────
-- Used in question-bank.vue (report issue button)
create table if not exists public.question_reports (
  id           uuid primary key default uuid_generate_v4(),
  reported_by  uuid not null references auth.users(id) on delete cascade,
  question_id  bigint not null references public.questions(id) on delete cascade,
  reason       text not null,                               -- free-text or enum: 'wrong_answer' | 'typo' | 'unclear' | 'other'
  created_at   timestamptz not null default now()
);


-- ── Written Questions ────────────────────────────────────────
-- hsc-ssc-exam.vue has a two-phase exam: MCQ phase then a
-- written/creative section. Written questions are a separate
-- content type with type 'saq' or 'creative', marks per question,
-- and no multiple-choice options.
create table if not exists public.written_questions (
  id           bigserial primary key,
  exam         text not null,            -- same stream values: HSC, SSC etc.
  subject      jsonb not null,            -- plain English e.g. "Chemistry"
  chapter      jsonb not null,
  type         text not null default 'creative' check (type in ('saq','creative')),
  marks        smallint not null default 10,
  -- Question text is long-form (Bangla or English), stored as plain text
  -- since it doesn't need the bilingual JSONB split (admin writes one version)
  question     jsonb not null,
  year         jsonb,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists idx_written_questions_exam     on public.written_questions(exam);
create index if not exists idx_written_questions_subject  on public.written_questions(subject);
create index if not exists idx_written_questions_chapter  on public.written_questions(chapter);
create index if not exists idx_written_questions_active   on public.written_questions(is_active) where is_active = true;

-- ── Exam Results (legacy-compatible) ─────────────────────────
-- Kept for backward compatibility with the existing schema.
-- New code should use exam_sessions; this is a simpler summary view
-- used in progress.vue history table and mock-exam.vue recent results.
-- Drives progress.vue history table, score trend chart, difficulty
-- breakdown widget, and leaderboard aggregation.
create table if not exists public.exam_results (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  session_id       uuid references public.exam_sessions(id) on delete set null,

  -- Human-readable label for progress.vue history table
  -- e.g. "HSC Physics Mock", "BCS General Practice"
  title            text,

  subject          jsonb not null,
  chapter          jsonb not null,
  stream           text,                             -- for leaderboard / progress filters
  exam_type        text not null,    -- 'mock' | 'practice' | 'admission' | 'hsc_ssc' | 'engineering'

  -- Full result breakdown (from mock-exam.vue result computed object)
  score            int not null,                    -- 0–100 percentage
  marks_earned     numeric(6,2) not null default 0, -- after −0.25 negative marking deduction
  questions_count  int not null default 0,
  correct_count    int not null default 0,
  wrong_count      int not null default 0,
  skipped_count    int not null default 0,
  duration_mins    int,                             -- actual time spent

  -- progress.vue history table "passed" / "failed" badge
  status           text not null default 'passed' check (status in ('passed','failed')),

  -- Progress.vue difficulty-accuracy breakdown chart
  -- Shape: { "easy": { correct: 14, total: 16 }, "medium": {...}, "hard": {...} }
  difficulty_breakdown jsonb,

  created_at       timestamptz not null default now()
);

create index if not exists idx_exam_results_user    on public.exam_results(user_id);
create index if not exists idx_exam_results_subject on public.exam_results(subject);
create index if not exists idx_exam_results_chapter on public.exam_results(chapter);
create index if not exists idx_exam_results_created on public.exam_results(created_at desc);


-- ============================================================
-- SECTION 5: PROGRESS TRACKING
-- ============================================================

-- ── Daily Activity ───────────────────────────────────────────
-- One row per user per day — upserted when questions are answered.
-- Powers the streak calendar on index.vue and progress.vue.
create table if not exists public.daily_activity (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  date                 date not null,
  questions_answered   int not null default 0,
  correct_count        int not null default 0,      -- for accuracy tracking
  wrong_count          int not null default 0,
  skipped_count        int not null default 0,
  duration_mins        int not null,
  exams_completed      int not null default 0
  --unique(user_id, date) -- should it be unique(user_id, data) as claude suggested
);

create index if not exists idx_daily_activity_user on public.daily_activity(user_id);
create index if not exists idx_daily_activity_date on public.daily_activity(date desc);

-- ── Subject Mastery ──────────────────────────────────────────
-- One row per user × subject combination.
-- Used in progress.vue mastery grid and topic strength sidebar.
create table if not exists public.subject_mastery (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  subject         jsonb not null,                   -- e.g. "Physics"
  --chapter         jsonb not null,                   -- e.g. "Kinematics"
  stream          text not null,                   -- e.g. "HSC"
  mastery_percent int not null default 0 check (mastery_percent between 0 and 100),
  exams_count     int not null default 0,
  question_count  int not null default 0,
  correct_count   int not null default 0,
  wrong_count   int not null default 0,
  skipped_count   int not null default 0,
  trend           int not null default 0,          -- +/- change since last week
  updated_at      timestamptz not null default now()
  --unique(user_id, subject, stream) -- should it be unique(user_id, subject, chapter, stream) as claude suggested
);

create index if not exists idx_subject_mastery_user on public.subject_mastery(user_id);

-- ── Topic Mastery ────────────────────────────────────────────
-- Granular mastery per chapter/topic within a subject.
-- Used in progress.vue "Weak Topics" drill-down and question-bank.vue
-- recommended topics on index.vue.
create table if not exists public.topic_mastery (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  topic           jsonb not null,                   -- chapter name (english)
  subject         jsonb not null,
  stream          text not null,
  mastery_percent int not null default 0 check (mastery_percent between 0 and 100),
  exams_count     int not null default 0,
  question_count  int not null default 0,
  correct_count   int not null default 0,
  wrong_count   int not null default 0,
  skipped_count   int not null default 0,
  updated_at      timestamptz not null default now()
  --unique(user_id, topic, subject, stream)
);

create index if not exists idx_topic_mastery_user on public.topic_mastery(user_id);

create or replace function public.upsert_mastery(
  p_user_id    uuid,
  p_subject_en text,
  p_subject_bn text,
  p_topic_en   text,
  p_topic_bn   text,
  p_stream     text,
  p_correct    int,
  p_wrong      int,
  p_skipped    int,
  p_is_exam    boolean default false   -- true = mock, false = qbank
)
returns void as $$
declare
  v_sub_correct  int;
  v_sub_wrong    int;
  v_old_mastery  int;
  v_new_mastery  int;
begin

  -- ── subject_mastery ─────────────────────────────────────────
  select correct_count, wrong_count, mastery_percent
    into v_sub_correct, v_sub_wrong, v_old_mastery
  from public.subject_mastery
  where user_id = p_user_id
    and subject->>'english' = p_subject_en
    and stream = p_stream;

  v_new_mastery := case
    when coalesce(v_sub_correct,0) + p_correct + coalesce(v_sub_wrong,0) + p_wrong = 0 then 0
    else round(
      (coalesce(v_sub_correct,0) + p_correct)::numeric /
      (coalesce(v_sub_correct,0) + p_correct + coalesce(v_sub_wrong,0) + p_wrong) * 100
    )
  end;

  insert into public.subject_mastery
    (user_id, subject, stream,
     mastery_percent, exams_count, question_count,
     correct_count, wrong_count, skipped_count, trend, updated_at)
  values
    (p_user_id,
     jsonb_build_object('english', p_subject_en, 'bangla', p_subject_bn),
     p_stream,
     coalesce(round(p_correct::numeric / nullif(p_correct + p_wrong, 0) * 100), 0),
     case when p_is_exam then 1 else 0 end,
     p_correct + p_wrong + p_skipped,
     p_correct, p_wrong, p_skipped, 0, now())
  on conflict (user_id, (subject->>'english'), stream) do update set
    mastery_percent = v_new_mastery,
    exams_count     = subject_mastery.exams_count + case when p_is_exam then 1 else 0 end,
    question_count  = subject_mastery.question_count + p_correct + p_wrong + p_skipped,
    correct_count   = subject_mastery.correct_count  + p_correct,
    wrong_count     = subject_mastery.wrong_count    + p_wrong,
    skipped_count   = subject_mastery.skipped_count  + p_skipped,
    trend           = v_new_mastery - coalesce(v_old_mastery, v_new_mastery),
    updated_at      = now();

  -- ── topic_mastery ────────────────────────────────────────────
  insert into public.topic_mastery
    (user_id, topic, subject, stream,
     mastery_percent, exams_count, question_count,
     correct_count, wrong_count, skipped_count, updated_at)
  values
    (p_user_id,
     jsonb_build_object('english', p_topic_en, 'bangla', p_topic_bn),
     jsonb_build_object('english', p_subject_en, 'bangla', p_subject_bn),
     p_stream,
     coalesce(round(p_correct::numeric / nullif(p_correct + p_wrong, 0) * 100), 0),
     case when p_is_exam then 1 else 0 end,
     p_correct + p_wrong + p_skipped,
     p_correct, p_wrong, p_skipped, now())
  on conflict (user_id, (topic->>'english'), (subject->>'english'), stream) do update set
    mastery_percent = round(
      (topic_mastery.correct_count + p_correct)::numeric /
      nullif(topic_mastery.correct_count + p_correct +
             topic_mastery.wrong_count   + p_wrong, 0) * 100
    ),
    exams_count    = topic_mastery.exams_count + case when p_is_exam then 1 else 0 end,
    question_count = topic_mastery.question_count + p_correct + p_wrong + p_skipped,
    correct_count  = topic_mastery.correct_count  + p_correct,
    wrong_count    = topic_mastery.wrong_count    + p_wrong,
    skipped_count  = topic_mastery.skipped_count  + p_skipped,
    updated_at     = now();

end;
$$ language plpgsql security definer;

create unique index uq_subject_mastery
  on public.subject_mastery (user_id, (subject->>'english'), stream);

create unique index uq_topic_mastery
  on public.topic_mastery (user_id, (topic->>'english'), (subject->>'english'), stream);


-- ============================================================
-- SECTION 6: LEADERBOARD
-- ============================================================

-- ── Leaderboard ──────────────────────────────────────────────
-- One row per user. Refreshed by a scheduled cron/function.
-- Supports the full leaderboard.vue data shape including stream,
-- accuracy, exams count, streak, and rank change.
-- Period scores support leaderboard.vue's week/month/all-time filter.
create table if not exists public.leaderboard (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  display_name       text not null,
  initials           text,                              -- 2-char initials for avatar (e.g. "FR")
  stream             text,                              -- primary stream for stream filter

  -- All-time totals
  total_score        int not null default 0,
  exams_count        int not null default 0,
  accuracy           int not null default 0,            -- 0–100 percentage
  streak             int not null default 0,
  rank               int,
  rank_change        int not null default 0,            -- positive = moved up, negative = moved down

  -- Period scores for leaderboard.vue week / month filter tabs
  score_this_week    int not null default 0,
  score_this_month   int not null default 0,

  updated_at         timestamptz not null default now(),
  unique(user_id)
);

create index if not exists idx_leaderboard_score  on public.leaderboard(total_score desc);
create index if not exists idx_leaderboard_stream on public.leaderboard(stream);


-- ============================================================
-- SECTION 7: ANNOUNCEMENTS
-- ============================================================
-- Used in the admin panel Content tab (index.vue).
-- Admins create announcements as drafts, then publish them live.
-- Students can see 'live' announcements on the dashboard.
create table if not exists public.announcements (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  body         text,
  status       text not null default 'draft' check (status in ('draft','live','archived')),
  created_by   uuid references auth.users(id) on delete set null,
  published_at timestamptz,                    -- set when status flips to 'live'
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_announcements_status  on public.announcements(status);
create index if not exists idx_announcements_created on public.announcements(created_at desc);


-- ============================================================
-- SECTION 8: ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles          enable row level security;
alter table public.questions         enable row level security;
alter table public.written_questions enable row level security;
alter table public.bookmarks         enable row level security;
alter table public.question_attempts enable row level security;
alter table public.question_reports  enable row level security;
alter table public.exam_sessions     enable row level security;
alter table public.exam_results      enable row level security;
alter table public.daily_activity    enable row level security;
alter table public.subject_mastery   enable row level security;
alter table public.topic_mastery     enable row level security;
alter table public.leaderboard       enable row level security;
alter table public.announcements     enable row level security;

-- Profiles: own data only
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id);

-- Questions: students see published only; admins (service role) manage all
create policy "questions_select_published" on public.questions
  for select using (status = 'published');

-- Written questions: everyone can read active ones, service role writes
create policy "written_questions_select_active" on public.written_questions
  for select using (is_active = true);

-- Announcements: students see live only; admins manage all via service role
create policy "announcements_select_live" on public.announcements
  for select using (status = 'live');

-- Bookmarks: own data only
create policy "bookmarks_select_own" on public.bookmarks
  for select using (auth.uid() = user_id);
create policy "bookmarks_insert_own" on public.bookmarks
  for insert with check (auth.uid() = user_id);
create policy "bookmarks_delete_own" on public.bookmarks
  for delete using (auth.uid() = user_id);

-- Question attempts: own data only
create policy "attempts_select_own" on public.question_attempts
  for select using (auth.uid() = user_id);
create policy "attempts_insert_own" on public.question_attempts
  for insert with check (auth.uid() = user_id);

-- Question reports: own data only
create policy "reports_insert_own" on public.question_reports
  for insert with check (auth.uid() = reported_by);

-- Exam sessions: own data only
create policy "sessions_select_own" on public.exam_sessions
  for select using (auth.uid() = user_id);
create policy "sessions_insert_own" on public.exam_sessions
  for insert with check (auth.uid() = user_id);

-- Exam results: own data only
create policy "exam_results_select_own" on public.exam_results
  for select using (auth.uid() = user_id);
create policy "exam_results_insert_own" on public.exam_results
  for insert with check (auth.uid() = user_id);

-- Daily activity: own data only
create policy "daily_activity_select_own" on public.daily_activity
  for select using (auth.uid() = user_id);
create policy "daily_activity_insert_own" on public.daily_activity
  for insert with check (auth.uid() = user_id);
create policy "daily_activity_update_own" on public.daily_activity
  for update using (auth.uid() = user_id);

-- Subject mastery: own data only
create policy "subject_mastery_select_own" on public.subject_mastery
  for select using (auth.uid() = user_id);
create policy "subject_mastery_insert_own" on public.subject_mastery
  for insert with check (auth.uid() = user_id);
create policy "subject_mastery_update_own" on public.subject_mastery
  for update using (auth.uid() = user_id);

-- Topic mastery: own data only
create policy "topic_mastery_select_own" on public.topic_mastery
  for select using (auth.uid() = user_id);
create policy "topic_mastery_insert_own" on public.topic_mastery
  for insert with check (auth.uid() = user_id);
create policy "topic_mastery_update_own" on public.topic_mastery
  for update using (auth.uid() = user_id);

-- Leaderboard: everyone can read, only service role writes
create policy "leaderboard_select_all" on public.leaderboard
  for select using (true);


-- ============================================================
-- SECTION 9: HELPER FUNCTIONS
-- ============================================================

-- ── Update streak on daily activity upsert ──────────────────
-- Call this after upserting a row in daily_activity.
-- Recalculates current streak and updates profiles accordingly.
create or replace function public.update_streak(p_user_id uuid)
returns void as $$
declare
  v_streak       int := 0;
  v_longest      int;
  v_check_date   date := current_date;
  v_row_exists   bool;
begin
  -- Walk backwards from today counting consecutive days with activity
  loop
    select exists(
      select 1 from public.daily_activity
      where user_id = p_user_id
        and date = v_check_date
        and questions_answered > 0
    ) into v_row_exists;

    exit when not v_row_exists;
    v_streak     := v_streak + 1;
    v_check_date := v_check_date - interval '1 day';
  end loop;

  -- Get current longest streak
  select longest_streak into v_longest
  from public.profiles where user_id = p_user_id;

  update public.profiles
  set streak         = v_streak,
      longest_streak = greatest(coalesce(v_longest, 0), v_streak),
      updated_at     = now()
  where user_id = p_user_id;
end;
$$ language plpgsql security definer;

-- ── Auto-update updated_at timestamp ────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach updated_at trigger to tables that have the column
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger trg_questions_updated_at
  before update on public.questions
  for each row execute procedure public.set_updated_at();

create trigger trg_subject_mastery_updated_at
  before update on public.subject_mastery
  for each row execute procedure public.set_updated_at();

create trigger trg_topic_mastery_updated_at
  before update on public.topic_mastery
  for each row execute procedure public.set_updated_at();

create trigger trg_announcements_updated_at
  before update on public.announcements
  for each row execute procedure public.set_updated_at();


-- ── Recalculate leaderboard ──────────────────────────────────
-- Called by the admin panel "Recalc Leaderboard" button (index.vue)
-- and by a nightly pg_cron job.
-- Aggregates exam_results per user, recomputes rank, upserts leaderboard.
-- Also computes score_this_week and score_this_month for the period
-- filter tabs in leaderboard.vue.
create or replace function public.recalculate_leaderboard()
returns void as $$
begin
  -- Step 1: upsert aggregate stats from exam_results into leaderboard
  insert into public.leaderboard (
    user_id,
    display_name,
    initials,
    stream,
    total_score,
    exams_count,
    accuracy,
    streak,
    score_this_week,
    score_this_month,
    rank_change,
    updated_at
  )
  select
    p.user_id,
    coalesce(p.display_name, split_part(p.full_name, ' ', 1), 'User')  as display_name,
    upper(left(coalesce(p.full_name, 'U'), 1) ||
          left(coalesce(split_part(p.full_name, ' ', 2), 'U'), 1))      as initials,
    p.primary_stream                                                     as stream,
    coalesce(sum(er.score), 0)                                          as total_score,
    count(er.id)                                                        as exams_count,
    coalesce(round(avg(er.score)), 0)                                   as accuracy,
    p.streak,
    -- score_this_week: sum of scores from the last 7 days
    coalesce((
      select sum(er2.score) from public.exam_results er2
      where er2.user_id = p.user_id
        and er2.created_at >= now() - interval '7 days'
    ), 0)                                                               as score_this_week,
    -- score_this_month: sum of scores from the last 30 days
    coalesce((
      select sum(er3.score) from public.exam_results er3
      where er3.user_id = p.user_id
        and er3.created_at >= now() - interval '30 days'
    ), 0)                                                               as score_this_month,
    -- rank_change: previous rank minus new position (positive = moved up)
    coalesce(
      (select lb.rank from public.leaderboard lb where lb.user_id = p.user_id) -
      row_number() over (order by sum(er.score) desc),
      0
    )::int                                                              as rank_change,
    now()
  from public.profiles p
  left join public.exam_results er on er.user_id = p.user_id
  group by p.user_id, p.display_name, p.full_name, p.primary_stream, p.streak
  on conflict (user_id) do update set
    display_name     = excluded.display_name,
    initials         = excluded.initials,
    stream           = excluded.stream,
    total_score      = excluded.total_score,
    exams_count      = excluded.exams_count,
    accuracy         = excluded.accuracy,
    streak           = excluded.streak,
    score_this_week  = excluded.score_this_week,
    score_this_month = excluded.score_this_month,
    rank_change      = excluded.rank_change,
    updated_at       = now();

  -- Step 2: assign rank by total_score descending
  update public.leaderboard lb
  set rank = ranked.new_rank
  from (
    select user_id, row_number() over (order by total_score desc) as new_rank
    from public.leaderboard
  ) ranked
  where lb.user_id = ranked.user_id;
end;
$$ language plpgsql security definer;


-- ============================================================
-- SECTION 10: MODERATOR TABLES
-- ============================================================
-- These tables back the moderator panel (pages/dashboard/moderator/index.vue).
-- Moderators have role = 'moderator' in profiles. They cannot access admin-only
-- tables directly — all writes go through service-role Edge Functions or
-- RLS policies that check the caller's role from profiles.


-- ── Question Submissions ─────────────────────────────────────
-- Moderators submit new questions here. Admins review them in the
-- admin Review Queue tab. On approval the question is inserted into
-- the main questions table and this row's status is set to 'approved'.
-- On fix-and-resubmit the status resets to 'pending' with a cleared admin_note.
create table if not exists public.question_submissions (
  id               uuid primary key default uuid_generate_v4(),

  -- Who submitted it
  submitted_by     uuid not null references auth.users(id) on delete cascade,

  -- Question content (mirrors questions table structure)
  -- Plain text used here — bilingual JSONB is handled on admin approval
  -- when the question is promoted to the main questions table.
  question         jsonb,
  question_hash    text,             -- hash of the question text
  question_image   text,             -- image for the question if any
  stimulus         jsonb,            -- { english, bangla }
  stimulus_hash    text,             -- hash of the stimuli text
  stimulus_image   text,             -- image for the stimuli if any
  years            jsonb,
  difficulty       jsonb not null,
  stream           text not null,
  text_book        text,
  subject          jsonb not null,
  chapter          jsonb not null,
  source           jsonb,             -- e.g. "BUET 2023 Question Paper"
  difficulty_level text not null default 'medium'
                     check (difficulty_level in ('easy','medium','hard')),

  -- Options stored as a plain text array [A, B, C, D]
  options          jsonb not null,
  correct_index    smallint not null check (correct_index between 0 and 3),
  explanation      jsonb,

  -- Workflow status
  -- 'pending'  — awaiting admin review (default on submit and resubmit)
  -- 'approved' — admin approved; question promoted to questions table
  -- 'rejected' — admin rejected; moderator can edit and resubmit
  -- 'fixed'    — mod fixed a reported question; awaiting admin re-approval
  status           text not null default 'pending'
                     check (status in ('pending','approved','rejected','fixed')),

  -- ID of the question_report this submission is fixing (null for new submissions)
  -- Set when a moderator uses Fix & Resubmit on a reported question.
  fixes_report_id  uuid references public.question_reports(id) on delete set null,

  -- Admin feedback sent back to the moderator on rejection
  admin_note       text,

  -- Timestamps
  submitted_at     timestamptz not null default now(),
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_qsub_submitted_by on public.question_submissions(submitted_by);
create index if not exists idx_qsub_status       on public.question_submissions(status);
create index if not exists idx_qsub_stream       on public.question_submissions(stream);

create trigger trg_qsub_updated_at
  before update on public.question_submissions
  for each row execute procedure public.set_updated_at();


-- ── User Warnings ────────────────────────────────────────────
-- Issued by moderators to users for misconduct. Each warning is
-- a separate row so full history is preserved.
-- The moderator page shows the current status (active / cleared / watched),
-- warning count, and the most recent reason.
create table if not exists public.user_warnings (
  id          uuid primary key default uuid_generate_v4(),

  -- The user being warned
  user_id     uuid not null references auth.users(id) on delete cascade,

  -- The moderator who issued the warning
  issued_by   uuid not null references auth.users(id) on delete set null,

  -- Free-text reason sent to the user (shown in moderator panel)
  reason      text not null,

  -- message is the full warning text optionally sent to the user
  message     text,

  -- Lifecycle
  -- 'active'  — warning is live on the user's record
  -- 'cleared' — moderator cleared the warning
  -- 'watched' — user is on watch without a formal warning yet
  status      text not null default 'active'
                check (status in ('active','cleared','watched')),

  cleared_by  uuid references auth.users(id) on delete set null,
  cleared_at  timestamptz,

  created_at  timestamptz not null default now()
);

create index if not exists idx_warnings_user      on public.user_warnings(user_id);
create index if not exists idx_warnings_issued_by on public.user_warnings(issued_by);
create index if not exists idx_warnings_status    on public.user_warnings(status);


-- ── Discussions ──────────────────────────────────────────────
-- Discussion threads visible to moderators for monitoring.
-- Populated by the discussion feature (not yet built as a student-facing
-- page, but the table is needed so the moderator panel can read/write it).
create table if not exists public.discussions (
  id              uuid primary key default uuid_generate_v4(),

  title           text not null,
  stream          text not null default 'General',

  -- Aggregates (updated by triggers or Edge Functions)
  replies_count   int not null default 0,
  flag_count      int not null default 0,

  -- Moderation state
  -- 'open'    — normal, visible to students
  -- 'flagged' — has unreviewed reports (flag_count > threshold)
  -- 'locked'  — moderator locked it; students cannot reply
  status          text not null default 'open'
                    check (status in ('open','flagged','locked')),

  locked_by       uuid references auth.users(id) on delete set null,
  locked_at       timestamptz,

  last_active_at  timestamptz not null default now(),
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_discussions_stream on public.discussions(stream);
create index if not exists idx_discussions_status on public.discussions(status);
create index if not exists idx_discussions_active on public.discussions(last_active_at desc);

create trigger trg_discussions_updated_at
  before update on public.discussions
  for each row execute procedure public.set_updated_at();


-- ── Mod Actions (Audit Log) ───────────────────────────────────
-- Every meaningful action by an admin or moderator is logged here.
-- Powers the Mod Activity tab (moderator panel) and the admin audit log
-- sidebar. Written to by Edge Functions — never by client RLS.
--
-- action_type values used by the pages:
--   admin:   'ban','unban','promote','demote','publish_q','reject_q',
--            'delete_q','publish_ann','delete_ann','cache_purge',
--            'leaderboard_recalc','db_backup','streak_cron'
--   mod:     'approve_q','reject_q','warn_user','clear_warning',
--            'watch_user','dismiss_report','resolve_report',
--            'escalate_report','fix_q','submit_q','lock_disc',
--            'unlock_disc','clear_flags'
create table if not exists public.mod_actions (
  id           uuid primary key default uuid_generate_v4(),

  -- Who did it (admin or moderator)
  actor_id     uuid not null references auth.users(id) on delete set null,
  actor_role   text not null check (actor_role in ('admin','moderator')),

  -- What they did
  action_type  text not null,

  -- What they did it to (optional — null for system-wide actions)
  target_type  text,   -- 'user' | 'question' | 'submission' | 'discussion' | 'report' | 'system'
  target_id    text,   -- uuid or bigint cast to text for flexibility

  -- Human-readable summary (shown in the UI log)
  description  text not null,

  -- Optional extra context (e.g. rejection reason, warning message)
  metadata     jsonb,

  created_at   timestamptz not null default now()
);

create index if not exists idx_mod_actions_actor   on public.mod_actions(actor_id);
create index if not exists idx_mod_actions_type    on public.mod_actions(action_type);
create index if not exists idx_mod_actions_created on public.mod_actions(created_at desc);


-- ============================================================
-- SECTION 11: RLS FOR NEW TABLES
-- ============================================================

alter table public.question_submissions enable row level security;
alter table public.user_warnings         enable row level security;
alter table public.discussions            enable row level security;
alter table public.mod_actions            enable row level security;

-- question_submissions:
--   Moderators can read and insert their own submissions.
--   Status updates (approve/reject) are done via service role.
create policy "qsub_select_own" on public.question_submissions
  for select using (auth.uid() = submitted_by);

create policy "qsub_insert_own" on public.question_submissions
  for insert with check (auth.uid() = submitted_by);

-- Moderators can update their own submissions only while still pending
-- (to allow editing before admin reviews). Service role handles status updates.
create policy "qsub_update_own_pending" on public.question_submissions
  for update using (auth.uid() = submitted_by and status in ('pending','rejected'));

-- user_warnings:
--   Moderators can read warnings they issued.
--   The warned user can read warnings against themselves.
--   All writes are via service role to prevent tampering.
create policy "warnings_select_issued_by" on public.user_warnings
  for select using (auth.uid() = issued_by);

create policy "warnings_select_own" on public.user_warnings
  for select using (auth.uid() = user_id);

-- discussions:
--   All authenticated users can read open discussions.
--   Moderators and admins manage via service role.
create policy "discussions_select_open" on public.discussions
  for select using (status = 'open');

-- mod_actions:
--   Moderators can read their own actions (activity log).
--   Admins can read all actions via service role.
create policy "mod_actions_select_own" on public.mod_actions
  for select using (auth.uid() = actor_id);


-- ============================================================
-- SECTION 12: HELPER FUNCTION — APPROVE SUBMISSION
-- ============================================================
-- Called by the admin panel when approving a question from the
-- Review Queue. Inserts into questions, marks submission approved,
-- optionally resolves the linked question_report (for fix-resubmits).
create or replace function public.approve_submission(p_submission_id uuid)
returns bigint as $$
declare
  v_sub    public.question_submissions%rowtype;
  v_new_id bigint;
begin
  -- Load submission
  select * into v_sub
  from public.question_submissions
  where id = p_submission_id and status in ('pending','fixed');

  if not found then
    raise exception 'Submission % not found or not pending', p_submission_id;
  end if;

  -- Insert into questions table as published
  -- (bilingual JSONB wrapping: wrap plain text into { "english": "..." })
  insert into public.questions (
    exam, question, options, explanation, subject, chapter,
    difficulty_level, correct_index, status
  ) values (
    v_sub.stream,
    jsonb_build_object('english', v_sub.text, 'bangla', ''),
    jsonb_build_object(
      'english', v_sub.options,
      'bangla',  v_sub.options   -- moderator submissions are English-only initially
    ),
    case when v_sub.explanation is not null
         then jsonb_build_object('english', v_sub.explanation, 'bangla', '')
         else null end,
    jsonb_build_object('english', v_sub.subject, 'bangla', ''),
    jsonb_build_object('english', 'General', 'bangla', ''),  -- chapter defaults to General
    v_sub.difficulty_level,
    v_sub.correct_index,
    'published'
  )
  returning id into v_new_id;

  -- Mark submission approved
  update public.question_submissions
  set status      = 'approved',
      reviewed_at = now(),
      updated_at  = now()
  where id = p_submission_id;

  -- If this was a fix-resubmit, resolve the linked report
  if v_sub.fixes_report_id is not null then
    -- question_reports has no status col — set the original question to published
    -- and flag the report as handled by deleting or by a metadata update.
    -- For now: update the original question's status back to published.
    -- (The question_id is retrieved from the report.)
    update public.questions q
    set status     = 'published',
        updated_at = now()
    from public.question_reports r
    where r.id = v_sub.fixes_report_id
      and r.question_id = q.id;
  end if;

  return v_new_id;
end;
$$ language plpgsql security definer;


-- ============================================================
-- ============================================================
-- NOTES
-- ============================================================
-- Questions table — bilingual JSONB structure:
--
--   question:    { "english": "...", "bangla": "..." }
--   options:     { "english": ["A","B","C","D"], "bangla": ["ক","খ","গ","ঘ"] }
--   explanation: { "english": "...", "bangla": "..." }
--   subject:     { "english": "Physics", "bangla": "পদার্থবিজ্ঞান" }
--   chapter:     { "english": "Optics", "bangla": "আলোকবিজ্ঞান" }
--   difficulty:  { "english": "hard", "bangla": "কঠিন" }
--   year:        { "english": "2023", "bangla": "২০২৩" }
--
-- Question status values:
--   'published' — visible to all students
--   'draft'     — hidden from students; admin panel only
--   'flagged'   — under review; set when question_reports threshold is met
--
-- Written questions (hsc-ssc-exam.vue two-phase format):
--   Stored in written_questions (plain text, not bilingual JSONB).
--   Student answers saved in exam_sessions.written_answers JSONB.
--   type: 'saq' (short answer) | 'creative' (4-part ক/খ/গ/ঘ style)
--
-- Profile role / status values:
--   role:   'user' | 'moderator' | 'admin'
--   status: 'active' | 'banned' | 'unverified'
--   Guard admin routes in Nuxt middleware using the role field.
--   Guard moderator routes the same way — check role IN ('moderator','admin').
--   Always read role via service role key, never expose to client RLS.
--
-- exam_results.difficulty_breakdown JSONB shape:
--   { "easy":   { "correct": 14, "total": 16 },
--     "medium": { "correct": 9,  "total": 14 },
--     "hard":   { "correct": 4,  "total": 8  } }
--   Drives the accuracy-by-difficulty chart on progress.vue.
--
-- exam_results.status: 'passed' if score >= 50, else 'failed'.
--   Set this on insert from the client after submitExam().
--
-- Leaderboard period scores:
--   score_this_week  — sum of exam_results.score in last 7 days
--   score_this_month — sum of exam_results.score in last 30 days
--   Used by leaderboard.vue period filter tabs (week / month / all-time).
--
-- Exam stream values used across all pages:
--   HSC, SSC, BUET, Medical (MBBS), BCS, Bank,
--   DU (Dhaka University — units Ka/Kha/Ga/Gha),
--   RU (Rajshahi), CU (Chittagong), JU (Jahangirnagar),
--   IU (Islamic), SUST, KUET, RUET, CUET
--
-- Leaderboard refresh:
--   Call recalculate_leaderboard() via:
--   1. Admin panel "Recalc Leaderboard" button → Supabase Edge Function
--   2. Nightly pg_cron job:
--      select cron.schedule('nightly-leaderboard', '0 2 * * *',
--        $$select public.recalculate_leaderboard()$$);
--
-- Announcements:
--   Set published_at = now() when flipping status to 'live'.
--   Use a Supabase Edge Function or DB trigger to do this automatically.
-- ============================================================
