-- Migration 14: Fix rating_or_status check constraint to support liked videos without log ratings
-- Run this in Supabase SQL Editor (Project -> SQL Editor -> New Query)

alter table public.ratings drop constraint if exists rating_or_status;

alter table public.ratings add constraint rating_or_status 
  check (rating is not null or watch_status is not null or liked = true);
