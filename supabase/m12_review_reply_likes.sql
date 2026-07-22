-- Migration: m12_review_reply_likes.sql
-- Description: Create review_reply_likes table for reply like counts

create table if not exists review_reply_likes (
    user_id uuid references profiles(id) on delete cascade,
    reply_id uuid references review_replies(id) on delete cascade,
    created_at timestamptz default now(),
    primary key (user_id, reply_id)
);

-- Enable RLS
alter table review_reply_likes enable row level security;

-- RLS Policies
create policy "Anyone can view review_reply_likes" on review_reply_likes
    for select using (true);

create policy "Users can insert their own review_reply_likes" on review_reply_likes
    for insert with check (auth.uid() = user_id);

create policy "Users can delete their own review_reply_likes" on review_reply_likes
    for delete using (auth.uid() = user_id);
