-- Migration 13: Bug Reports & Feedback System
-- Run this complete script in Supabase SQL Editor (Project -> SQL Editor -> New Query)

-- 1. Create public.bug_reports table first
create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  contact_email text,
  title text not null,
  description text not null,
  category text not null check (category in ('ui_ux', 'extension', 'ratings_reviews', 'lists_social', 'performance', 'account', 'other')),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'under_review', 'in_progress', 'resolved', 'closed')),
  steps_to_reproduce text,
  environment text,
  upvotes_count integer default 0 check (upvotes_count >= 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Create public.bug_report_upvotes table
create table if not exists public.bug_report_upvotes (
  bug_report_id uuid references public.bug_reports(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (bug_report_id, user_id)
);

-- 3. Row Level Security
alter table public.bug_reports enable row level security;
alter table public.bug_report_upvotes enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Bug reports are viewable by everyone" on public.bug_reports;
drop policy if exists "Anyone can insert bug reports" on public.bug_reports;
drop policy if exists "Users can update their own bug reports" on public.bug_reports;

drop policy if exists "Upvotes are viewable by everyone" on public.bug_report_upvotes;
drop policy if exists "Authenticated users can upvote bug reports" on public.bug_report_upvotes;
drop policy if exists "Users can remove their upvotes" on public.bug_report_upvotes;

-- Policies for bug_reports
create policy "Bug reports are viewable by everyone" 
  on public.bug_reports for select using (true);

create policy "Anyone can insert bug reports" 
  on public.bug_reports for insert 
  with check (true);

create policy "Users can update their own bug reports" 
  on public.bug_reports for update to authenticated 
  using (auth.uid() = user_id);

-- Policies for bug_report_upvotes
create policy "Upvotes are viewable by everyone" 
  on public.bug_report_upvotes for select using (true);

create policy "Authenticated users can upvote bug reports" 
  on public.bug_report_upvotes for insert to authenticated 
  with check (auth.uid() = user_id);

create policy "Users can remove their upvotes" 
  on public.bug_report_upvotes for delete to authenticated 
  using (auth.uid() = user_id);

-- 4. Trigger to maintain upvotes_count on bug_reports
create or replace function public.handle_bug_report_upvote_change()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.bug_reports 
    set upvotes_count = upvotes_count + 1,
        updated_at = now()
    where id = NEW.bug_report_id;
    return NEW;
  elsif (TG_OP = 'DELETE') then
    update public.bug_reports 
    set upvotes_count = greatest(0, upvotes_count - 1),
        updated_at = now()
    where id = OLD.bug_report_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_bug_report_upvote_added on public.bug_report_upvotes;
drop trigger if exists on_bug_report_upvote_removed on public.bug_report_upvotes;

create trigger on_bug_report_upvote_added
  after insert on public.bug_report_upvotes
  for each row execute function public.handle_bug_report_upvote_change();

create trigger on_bug_report_upvote_removed
  after delete on public.bug_report_upvotes
  for each row execute function public.handle_bug_report_upvote_change();
