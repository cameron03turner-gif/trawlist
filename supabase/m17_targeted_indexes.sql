-- Migration 17: Targeted Database Performance Indexing
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Index ratings table foreign keys & composite lookups
create index if not exists idx_ratings_user_id on public.ratings(user_id);
create index if not exists idx_ratings_video_id on public.ratings(video_id);
create index if not exists idx_ratings_user_video on public.ratings(user_id, video_id);
create index if not exists idx_ratings_watch_status on public.ratings(watch_status) where watch_status is not null;
create index if not exists idx_ratings_liked on public.ratings(liked) where liked = true;

-- 2. Index follows table for fast relationship & request checks
create index if not exists idx_follows_follower_id on public.follows(follower_id);
create index if not exists idx_follows_following_id on public.follows(following_id);
create index if not exists idx_follows_relationship on public.follows(follower_id, following_id, status);

-- 3. Index custom_lists & list_items for fast list rendering
create index if not exists idx_custom_lists_owner_id on public.custom_lists(owner_id);
create index if not exists idx_custom_lists_public on public.custom_lists(is_private) where is_private = false;
create index if not exists idx_list_items_list_id on public.list_items(list_id);
create index if not exists idx_list_items_video_id on public.list_items(video_id);

-- 4. Index notifications for instant unread badge & user feed
create index if not exists idx_notifications_user_unread on public.notifications(user_id, is_read);

-- 5. Index content_reports table
create index if not exists idx_content_reports_reporter on public.content_reports(reporter_id);
