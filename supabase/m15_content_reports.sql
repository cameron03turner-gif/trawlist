-- Migration 15: Inline Content Reports System
-- Run this complete script in Supabase SQL Editor (Project -> SQL Editor -> New Query)

-- 1. Create public.content_reports table
create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_type text not null check (target_type in ('review', 'reply', 'list', 'profile', 'other')),
  target_id text not null,
  target_url text,
  reason text not null check (reason in ('harassment', 'hate_speech', 'spam', 'piracy_copyright', 'inappropriate', 'impersonation', 'other')),
  details text,
  status text not null default 'open' check (status in ('open', 'under_review', 'action_taken', 'dismissed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Row Level Security
alter table public.content_reports enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Content reports are viewable by everyone" on public.content_reports;
drop policy if exists "Anyone can insert content reports" on public.content_reports;

-- Policies for content_reports
create policy "Content reports are viewable by everyone" 
  on public.content_reports for select using (true);

create policy "Anyone can insert content reports" 
  on public.content_reports for insert 
  with check (true);
