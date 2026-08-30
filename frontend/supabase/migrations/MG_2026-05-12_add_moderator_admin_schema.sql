-- ============================================================
-- CORTEX404 — Migration Script
-- Upgrades the simple schema (uploaded) to the full schema.
-- Safe to run on a database that already has the simple schema.
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Enable UUID extension (idempotent) ──────────────────────
create extension if not exists "uuid-ossp";

-- ============================================================
-- STEP 1: ALTER profiles — add missing columns
-- ============================================================

alter table public.profiles
  add column if not exists display_name    text,
  add column if not exists bio             text check (char_length(bio) <= 200),
  add column if not exists role            text not null default 'user'
                                             check (role in ('user','moderator','admin')),
  add column if not exists status          text not null default 'active'
                                             check (status in ('active','banned','unverified')),
  add column if not exists primary_stream  text default 'HSC',
  add column if not exists institution     text,
  add column if not exists district        text,
  add column if not exists theme           text not null default 'dark',
  add column if not exists font_size       text not null default 'default',
  add column if not exists exam_prefs      jsonb,
  add column if not exists notification_prefs jsonb;

-- ============================================================
-- STEP 2: ALTER exam_results — add missing columns
-- ============================================================

alter table public.exam_results
  add column if not exists title               text,
  add column if not exists stream              text,
  add column if not exists marks_earned        numeric(6,2) not null default 0,
  add column if not exists wrong_count         int not null default 0,
  add column if not exists skipped_count       int not null default 0,
  add column if not exists negative_marking    boolean not null default false,
  add column if not exists difficulty_breakdown jsonb,
  add column if not exists status              text not null default 'passed'
                                                 check (status in ('passed','failed')),
  add column if not exists session_id          uuid;

-- exam_type check: uploaded allows 'exam'|'practice'|'ai'
-- our schema allows 'mock'|'practice'|'admission'|'hsc_ssc'|'engineering'
-- Drop old constraint and replace with combined set
alter table public.exam_results
  drop constraint if exists exam_results_exam_type_check;

alter table public.exam_results
  add constraint exam_results_exam_type_check
    check (exam_type in ('exam','practice','ai','mock','admission','hsc_ssc','engineering'));

-- Missing indexes
create index if not exists idx_exam_results_user    on public.exam_results(user_id);
create index if not exists idx_exam_results_created on public.exam_results(created_at desc);
create index if not exists idx_exam_results_stream  on public.exam_results(stream);

-- ============================================================
-- STEP 3: ALTER leaderboard — add missing columns
-- ============================================================

alter table public.leaderboard
  add column if not exists stream            text,
  add column if not exists exam_count        int not null default 0,
  add column if not exists avg_score         numeric(5,2) not null default 0,
  add column if not exists accuracy          numeric(5,2) not null default 0,
  add column if not exists streak            int not null default 0,
  add column if not exists score_this_week   int not null default 0,
  add column if not exists score_this_month  int not null default 0,
  add column if not exists rank_change       int not null default 0;

-- ============================================================
-- STEP 4: Fix RLS policy name conflicts
-- ============================================================
-- The uploaded schema used 'upsert' in names; our schema uses 'insert'.
-- Drop old names before recreating under new names.

drop policy if exists "daily_activity_upsert_own"  on public.daily_activity;
drop policy if exists "topic_mastery_upsert_own"   on public.topic_mastery;

-- Recreate with consistent names (idempotent — create policy errors if exists,
-- so drop first)
drop policy if exists "daily_activity_insert_own"  on public.daily_activity;
drop policy if exists "topic_mastery_insert_own"   on public.topic_mastery;

create policy "daily_activity_insert_own" on public.daily_activity
  for insert with check (auth.uid() = user_id);

create policy "topic_mastery_insert_own" on public.topic_mastery
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- STEP 5: Create new tables (all use IF NOT EXISTS — safe)
-- ============================================================

-- ── Questions ────────────────────────────────────────────────
create table if not exists public.questions (
  id               bigint generated always as identity primary key,
  exam             text not null,
  question         jsonb not null,
  options          jsonb not null,
  explanation      jsonb,
  subject          jsonb,
  chapter          jsonb,
  difficulty_level text not null default 'medium'
                     check (difficulty_level in ('easy','medium','hard')),
  correct_index    smallint not null check (correct_index between 0 and 4),
  year             jsonb,
  status           text not null default 'published'
                     check (status in ('published','draft','flagged')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_questions_exam    on public.questions(exam);
create index if not exists idx_questions_status  on public.questions(status);

-- ── Bookmarks ─────────────────────────────────────────────────
create table if not exists public.bookmarks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  question_id bigint not null references public.questions(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(user_id, question_id)
);

-- ── Question Attempts ─────────────────────────────────────────
create table if not exists public.question_attempts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  question_id   bigint not null references public.questions(id) on delete cascade,
  chosen_index  smallint not null,
  is_correct    boolean not null,
  time_spent_ms int,
  created_at    timestamptz not null default now()
);

create index if not exists idx_attempts_user     on public.question_attempts(user_id);
create index if not exists idx_attempts_question on public.question_attempts(question_id);

-- ── Question Reports ──────────────────────────────────────────
create table if not exists public.question_reports (
  id          uuid primary key default uuid_generate_v4(),
  question_id bigint not null references public.questions(id) on delete cascade,
  reported_by uuid not null references auth.users(id) on delete cascade,
  reason      text not null,
  created_at  timestamptz not null default now()
);

-- ── Written Questions ─────────────────────────────────────────
create table if not exists public.written_questions (
  id           bigint generated always as identity primary key,
  exam         text not null,
  type         text not null default 'creative' check (type in ('saq','creative')),
  question     jsonb not null,
  marks        int not null default 10,
  subject      jsonb,
  chapter      jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Exam Sessions ─────────────────────────────────────────────
create table if not exists public.exam_sessions (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  exam_type        text not null,
  stream           text,
  subject          text,
  question_ids     bigint[],
  written_answers  jsonb,
  started_at       timestamptz not null default now(),
  submitted_at     timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists idx_sessions_user on public.exam_sessions(user_id);

-- ── Subject Mastery ───────────────────────────────────────────
create table if not exists public.subject_mastery (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  subject         text not null,
  stream          text not null,
  mastery_percent int not null default 0 check (mastery_percent between 0 and 100),
  exams_count     int not null default 0,
  questions_count int not null default 0,
  trend           text default 'stable' check (trend in ('up','down','stable')),
  updated_at      timestamptz not null default now(),
  unique(user_id, subject, stream)
);

create index if not exists idx_subject_mastery_user on public.subject_mastery(user_id);

-- ── Announcements ─────────────────────────────────────────────
create table if not exists public.announcements (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  body         text,
  status       text not null default 'draft' check (status in ('draft','live','archived')),
  created_by   uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_announcements_status on public.announcements(status);

-- ── Question Submissions (moderator → admin review) ───────────
create table if not exists public.question_submissions (
  id               uuid primary key default uuid_generate_v4(),
  submitted_by     uuid not null references auth.users(id) on delete cascade,
  text             text not null,
  stream           text not null,
  subject          text not null,
  difficulty_level text not null default 'medium'
                     check (difficulty_level in ('easy','medium','hard')),
  options          text[] not null,
  correct_index    smallint not null check (correct_index between 0 and 3),
  explanation      text,
  status           text not null default 'pending'
                     check (status in ('pending','approved','rejected','fixed')),
  fixes_report_id  uuid references public.question_reports(id) on delete set null,
  admin_note       text,
  submitted_at     timestamptz not null default now(),
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_qsub_submitted_by on public.question_submissions(submitted_by);
create index if not exists idx_qsub_status       on public.question_submissions(status);
create index if not exists idx_qsub_stream       on public.question_submissions(stream);

-- ── User Warnings (moderator panel) ──────────────────────────
create table if not exists public.user_warnings (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  issued_by   uuid not null references auth.users(id) on delete set null,
  reason      text not null,
  message     text,
  status      text not null default 'active'
                check (status in ('active','cleared','watched')),
  cleared_by  uuid references auth.users(id) on delete set null,
  cleared_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_warnings_user      on public.user_warnings(user_id);
create index if not exists idx_warnings_issued_by on public.user_warnings(issued_by);
create index if not exists idx_warnings_status    on public.user_warnings(status);

-- ── Discussions (moderator panel) ────────────────────────────
create table if not exists public.discussions (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  stream          text not null default 'General',
  replies_count   int not null default 0,
  flag_count      int not null default 0,
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

-- ── Mod Actions audit log (admin + moderator) ─────────────────
create table if not exists public.mod_actions (
  id           uuid primary key default uuid_generate_v4(),
  actor_id     uuid not null references auth.users(id) on delete set null,
  actor_role   text not null check (actor_role in ('admin','moderator')),
  action_type  text not null,
  target_type  text,
  target_id    text,
  description  text not null,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists idx_mod_actions_actor   on public.mod_actions(actor_id);
create index if not exists idx_mod_actions_type    on public.mod_actions(action_type);
create index if not exists idx_mod_actions_created on public.mod_actions(created_at desc);

-- ============================================================
-- STEP 6: RLS for all new tables
-- ============================================================

alter table public.questions          enable row level security;
alter table public.bookmarks          enable row level security;
alter table public.question_attempts  enable row level security;
alter table public.question_reports   enable row level security;
alter table public.written_questions  enable row level security;
alter table public.exam_sessions      enable row level security;
alter table public.subject_mastery    enable row level security;
alter table public.announcements      enable row level security;
alter table public.question_submissions enable row level security;
alter table public.user_warnings        enable row level security;
alter table public.discussions          enable row level security;
alter table public.mod_actions          enable row level security;

-- Questions: students see published only
drop policy if exists "questions_select_published"     on public.questions;
create policy "questions_select_published" on public.questions
  for select using (status = 'published');

-- Written questions: all authenticated users can read
drop policy if exists "written_questions_select_active" on public.written_questions;
create policy "written_questions_select_active" on public.written_questions
  for select using (true);

-- Announcements: authenticated users see live ones
drop policy if exists "announcements_select_live"      on public.announcements;
create policy "announcements_select_live" on public.announcements
  for select using (status = 'live');

-- Bookmarks
drop policy if exists "bookmarks_select_own" on public.bookmarks;
drop policy if exists "bookmarks_insert_own" on public.bookmarks;
drop policy if exists "bookmarks_delete_own" on public.bookmarks;
create policy "bookmarks_select_own" on public.bookmarks for select using (auth.uid() = user_id);
create policy "bookmarks_insert_own" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "bookmarks_delete_own" on public.bookmarks for delete using (auth.uid() = user_id);

-- Question attempts
drop policy if exists "attempts_select_own" on public.question_attempts;
drop policy if exists "attempts_insert_own" on public.question_attempts;
create policy "attempts_select_own" on public.question_attempts for select using (auth.uid() = user_id);
create policy "attempts_insert_own" on public.question_attempts for insert with check (auth.uid() = user_id);

-- Question reports: students can insert only
drop policy if exists "reports_insert_own" on public.question_reports;
create policy "reports_insert_own" on public.question_reports
  for insert with check (auth.uid() = reported_by);

-- Exam sessions
drop policy if exists "sessions_select_own" on public.exam_sessions;
drop policy if exists "sessions_insert_own" on public.exam_sessions;
create policy "sessions_select_own" on public.exam_sessions for select using (auth.uid() = user_id);
create policy "sessions_insert_own" on public.exam_sessions for insert with check (auth.uid() = user_id);

-- Subject mastery
drop policy if exists "subject_mastery_select_own" on public.subject_mastery;
drop policy if exists "subject_mastery_insert_own" on public.subject_mastery;
drop policy if exists "subject_mastery_update_own" on public.subject_mastery;
create policy "subject_mastery_select_own" on public.subject_mastery for select using (auth.uid() = user_id);
create policy "subject_mastery_insert_own" on public.subject_mastery for insert with check (auth.uid() = user_id);
create policy "subject_mastery_update_own" on public.subject_mastery for update using (auth.uid() = user_id);

-- Leaderboard: drop old and recreate (policy name same, safe)
drop policy if exists "leaderboard_select_all" on public.leaderboard;
create policy "leaderboard_select_all" on public.leaderboard for select using (true);

-- Question submissions: moderators manage own
drop policy if exists "qsub_select_own"          on public.question_submissions;
drop policy if exists "qsub_insert_own"          on public.question_submissions;
drop policy if exists "qsub_update_own_pending"  on public.question_submissions;
create policy "qsub_select_own" on public.question_submissions
  for select using (auth.uid() = submitted_by);
create policy "qsub_insert_own" on public.question_submissions
  for insert with check (auth.uid() = submitted_by);
create policy "qsub_update_own_pending" on public.question_submissions
  for update using (auth.uid() = submitted_by and status in ('pending','rejected'));

-- User warnings: moderator sees what they issued; warned user sees their own
drop policy if exists "warnings_select_issued_by" on public.user_warnings;
drop policy if exists "warnings_select_own"       on public.user_warnings;
create policy "warnings_select_issued_by" on public.user_warnings
  for select using (auth.uid() = issued_by);
create policy "warnings_select_own" on public.user_warnings
  for select using (auth.uid() = user_id);

-- Discussions: all authenticated users can read open threads
drop policy if exists "discussions_select_open" on public.discussions;
create policy "discussions_select_open" on public.discussions
  for select using (status = 'open');

-- Mod actions: each actor reads only their own log
drop policy if exists "mod_actions_select_own" on public.mod_actions;
create policy "mod_actions_select_own" on public.mod_actions
  for select using (auth.uid() = actor_id);

-- ============================================================
-- STEP 7: updated_at trigger function (safe re-create)
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to new tables that have updated_at
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_profiles_updated_at') then
    create trigger trg_profiles_updated_at
      before update on public.profiles
      for each row execute procedure public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_qsub_updated_at') then
    create trigger trg_qsub_updated_at
      before update on public.question_submissions
      for each row execute procedure public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_discussions_updated_at') then
    create trigger trg_discussions_updated_at
      before update on public.discussions
      for each row execute procedure public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_announcements_updated_at') then
    create trigger trg_announcements_updated_at
      before update on public.announcements
      for each row execute procedure public.set_updated_at();
  end if;
end $$;

-- ============================================================
-- STEP 8: recalculate_leaderboard function
-- ============================================================
create or replace function public.recalculate_leaderboard()
returns void as $$
begin
  insert into public.leaderboard (user_id, display_name, total_score,
    score_this_week, score_this_month, exam_count, avg_score, accuracy, rank)
  select
    p.user_id,
    coalesce(p.display_name, p.full_name, 'Anonymous'),
    coalesce(sum(e.score), 0),
    coalesce(sum(case when e.created_at >= now() - interval '7 days'  then e.score else 0 end), 0),
    coalesce(sum(case when e.created_at >= now() - interval '30 days' then e.score else 0 end), 0),
    count(e.id),
    coalesce(avg(e.score), 0),
    coalesce(avg(e.score), 0),
    0
  from public.profiles p
  left join public.exam_results e on e.user_id = p.user_id
  group by p.user_id, p.display_name, p.full_name
  on conflict (user_id) do update set
    display_name     = excluded.display_name,
    total_score      = excluded.total_score,
    score_this_week  = excluded.score_this_week,
    score_this_month = excluded.score_this_month,
    exam_count       = excluded.exam_count,
    avg_score        = excluded.avg_score,
    accuracy         = excluded.accuracy,
    updated_at       = now();

  -- Assign ranks ordered by total_score desc
  with ranked as (
    select user_id, row_number() over (order by total_score desc) as r
    from public.leaderboard
  )
  update public.leaderboard l
  set rank = ranked.r
  from ranked
  where l.user_id = ranked.user_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- STEP 9: approve_submission helper
-- ============================================================
create or replace function public.approve_submission(p_submission_id uuid)
returns bigint as $$
declare
  v_sub    public.question_submissions%rowtype;
  v_new_id bigint;
begin
  select * into v_sub
  from public.question_submissions
  where id = p_submission_id and status in ('pending','fixed');

  if not found then
    raise exception 'Submission % not found or not in pending/fixed state', p_submission_id;
  end if;

  insert into public.questions (
    exam, question, options, explanation, subject, chapter,
    difficulty_level, correct_index, status
  ) values (
    v_sub.stream,
    jsonb_build_object('english', v_sub.text,    'bangla', ''),
    jsonb_build_object('english', v_sub.options, 'bangla', v_sub.options),
    case when v_sub.explanation is not null
         then jsonb_build_object('english', v_sub.explanation, 'bangla', '')
         else null end,
    jsonb_build_object('english', v_sub.subject, 'bangla', ''),
    jsonb_build_object('english', 'General',     'bangla', ''),
    v_sub.difficulty_level,
    v_sub.correct_index,
    'published'
  )
  returning id into v_new_id;

  update public.question_submissions
  set status = 'approved', reviewed_at = now(), updated_at = now()
  where id = p_submission_id;

  -- If this fixed a reported question, flip it back to published
  if v_sub.fixes_report_id is not null then
    update public.questions q
    set status = 'published', updated_at = now()
    from public.question_reports r
    where r.id = v_sub.fixes_report_id and r.question_id = q.id;
  end if;

  return v_new_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- NOTES
-- ============================================================
-- Run this migration script ONCE on a database that already has
-- the simple schema (profiles, exam_results, daily_activity,
-- topic_mastery, leaderboard only).
--
-- All statements are idempotent:
--   ALTER TABLE ... ADD COLUMN IF NOT EXISTS  → no-op if exists
--   CREATE TABLE IF NOT EXISTS                → no-op if exists
--   DROP POLICY IF EXISTS + CREATE POLICY     → always fresh
--   CREATE OR REPLACE FUNCTION               → always fresh
--   CREATE INDEX IF NOT EXISTS               → no-op if exists
--
-- After running, your database will have the full schema
-- matching both the admin panel and the moderator panel.
--
-- profiles.role values: 'user' | 'moderator' | 'admin'
-- Nuxt middleware: always read role via SERVICE ROLE key.
-- Never trust role from the anon/client key.
--
-- Supabase pg_cron for leaderboard (optional):
--   select cron.schedule('nightly-leaderboard', '0 2 * * *',
--     $$select public.recalculate_leaderboard()$$);
-- ============================================================
