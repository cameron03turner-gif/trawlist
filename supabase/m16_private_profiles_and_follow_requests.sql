-- Migration 16: Private Profiles and Follow Requests
-- Run this complete script in Supabase SQL Editor (Project -> SQL Editor -> New Query)

-- 1. Add is_private column to profiles table
alter table public.profiles 
  add column if not exists is_private boolean default false;

-- 2. Add status column to follows table
alter table public.follows 
  add column if not exists status text default 'accepted' check (status in ('accepted', 'pending'));

-- 3. Update handle_new_follow trigger function to support follow_request notifications & pending status
create or replace function public.handle_new_follow()
returns trigger as $$
declare
  v_is_private boolean;
begin
  select is_private into v_is_private from public.profiles where id = NEW.following_id;

  if v_is_private is true then
    -- Set status to pending if account is private and status was not explicitly specified
    if NEW.status is null or NEW.status = 'accepted' then
      update public.follows 
      set status = 'pending' 
      where follower_id = NEW.follower_id and following_id = NEW.following_id;
    end if;

    insert into public.notifications (user_id, type, actor_id, entity_id)
    values (NEW.following_id, 'follow_request', NEW.follower_id, null);
  else
    insert into public.notifications (user_id, type, actor_id, entity_id)
    values (NEW.following_id, 'new_follower', NEW.follower_id, null);
  end if;

  return NEW;
end;
$$ language plpgsql security definer;
