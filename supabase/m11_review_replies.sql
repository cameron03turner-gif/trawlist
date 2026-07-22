-- Migration: m11_review_replies.sql
-- Description: Create review_replies table for YouTube-style comment reply chains

create table if not exists review_replies (
    id uuid primary key default gen_random_uuid(),
    rating_id uuid not null references ratings(id) on delete cascade,
    user_id uuid not null references profiles(id) on delete cascade,
    parent_reply_id uuid references review_replies(id) on delete cascade,
    content text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table review_replies enable row level security;

-- RLS Policies
create policy "Anyone can view review_replies" on review_replies
    for select using (true);

create policy "Users can insert their own review_replies" on review_replies
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own review_replies" on review_replies
    for update using (auth.uid() = user_id);

create policy "Users can delete their own review_replies" on review_replies
    for delete using (auth.uid() = user_id);
