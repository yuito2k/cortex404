-- ============================================================
-- CORTEX404 — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Enable UUID extension ───────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Profiles ────────────────────────────────────────────────
-- Auto-created when a user signs up (via trigger below)
create table if not exists public.profiles (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  full_name     text,
  avatar_url    text,
  streak        int not null default 0,
  longest_streak int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
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

-- ── Exam Results ─────────────────────────────────────────────
create table if not exists public.exam_results (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  subject          text not null,
  exam_type        text not null default 'exam',   -- 'exam' | 'practice' | 'ai'
  score            int not null,                   -- 0–100
  questions_count  int not null default 0,
  correct_count    int not null default 0,
  duration_seconds int,
  created_at       timestamptz not null default now()
);

create index if not exists idx_exam_results_user on public.exam_results(user_id);
create index if not exists idx_exam_results_created on public.exam_results(created_at desc);

-- ── Daily Activity ───────────────────────────────────────────
-- One row per user per day — upserted when questions are answered
create table if not exists public.daily_activity (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  date                date not null,
  questions_answered  int not null default 0,
  unique(user_id, date)
);

create index if not exists idx_daily_activity_user on public.daily_activity(user_id);

-- ── Topic Mastery ────────────────────────────────────────────
create table if not exists public.topic_mastery (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  topic           text not null,
  subject         text not null,
  mastery_percent int not null default 0,
  question_count  int not null default 0,
  updated_at      timestamptz not null default now(),
  unique(user_id, topic)
);

-- ── Leaderboard (materialized view, refreshed by cron) ───────
create table if not exists public.leaderboard (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  total_score  int not null default 0,
  rank         int,
  updated_at   timestamptz not null default now(),
  unique(user_id)
);

-- ── Row Level Security ───────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.exam_results   enable row level security;
alter table public.daily_activity enable row level security;
alter table public.topic_mastery  enable row level security;
alter table public.leaderboard    enable row level security;

-- Profiles: users can only read/update their own
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = user_id);

-- Exam results: own data only
create policy "exam_results_select_own" on public.exam_results for select using (auth.uid() = user_id);
create policy "exam_results_insert_own" on public.exam_results for insert with check (auth.uid() = user_id);

-- Daily activity: own data only
create policy "daily_activity_select_own" on public.daily_activity for select using (auth.uid() = user_id);
create policy "daily_activity_upsert_own" on public.daily_activity for insert with check (auth.uid() = user_id);
create policy "daily_activity_update_own" on public.daily_activity for update using (auth.uid() = user_id);

-- Topic mastery: own data only
create policy "topic_mastery_select_own" on public.topic_mastery for select using (auth.uid() = user_id);
create policy "topic_mastery_upsert_own" on public.topic_mastery for insert with check (auth.uid() = user_id);
create policy "topic_mastery_update_own" on public.topic_mastery for update using (auth.uid() = user_id);

-- Leaderboard: everyone can read, only service role writes
create policy "leaderboard_select_all" on public.leaderboard for select using (true);
