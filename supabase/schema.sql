-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query)

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text unique,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists profile_favourites (
  profile_id uuid references profiles(id) on delete cascade,
  video_id text references videos(id) on delete cascade,
  position int not null check (position between 1 and 4),
  primary key (profile_id, position)
);

create table if not exists videos (
  id text primary key, -- youtube video id
  title text not null,
  channel text,
  thumbnail_url text,
  url text not null,
  created_at timestamptz default now()
);

create type watch_status as enum ('want_to_watch', 'watching', 'watched', 'dropped');

create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  video_id text not null references videos(id) on delete cascade,
  rating numeric(2,1) check (rating >= 0 and rating <= 5),
  review text,
  note text,
  watch_status watch_status,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, video_id),
  constraint rating_or_status check (rating is not null or watch_status is not null)
);

create or replace view video_leaderboard as
select
  v.id,
  v.title,
  v.channel,
  v.thumbnail_url,
  v.url,
  avg(r.rating)::numeric(3,2) as avg_rating,
  count(r.rating) as rating_count,
  max(r.updated_at) as last_rated_at,
  c.thumbnail_url as channel_thumbnail_url
from videos v
left join channels c on v.channel_id = c.id
join ratings r on r.video_id = v.id
where r.rating is not null
group by v.id, c.thumbnail_url
order by avg_rating desc;

-- Auto-create a profile row whenever someone signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Row Level Security
alter table profiles enable row level security;
alter table profile_favourites enable row level security;
alter table videos enable row level security;
alter table ratings enable row level security;

create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

create policy "Videos are viewable by everyone" on videos for select using (true);
create policy "Authenticated users can add videos" on videos for insert to authenticated with check (true);
create policy "Authenticated users can update video metadata" on videos for update to authenticated using (true);

create policy "Ratings are viewable by everyone" on ratings for select using (true);
create policy "Users can insert their own ratings" on ratings for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own ratings" on ratings for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete their own ratings" on ratings for delete to authenticated using (auth.uid() = user_id);

create policy "Profile favourites are viewable by everyone" on profile_favourites for select using (true);
create policy "Users can insert their own favourites" on profile_favourites for insert to authenticated with check (auth.uid() = profile_id);
create policy "Users can update their own favourites" on profile_favourites for update to authenticated using (auth.uid() = profile_id);
create policy "Users can delete their own favourites" on profile_favourites for delete to authenticated using (auth.uid() = profile_id);

-- Milestone 3: Social & Lists

create table if not exists follows (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

create table if not exists lists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  is_ranked boolean default false,
  is_private boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists list_items (
  list_id uuid references lists(id) on delete cascade,
  video_id text references videos(id) on delete cascade,
  position int,
  note text,
  added_at timestamptz default now(),
  primary key (list_id, video_id)
);

alter table follows enable row level security;
alter table lists enable row level security;
alter table list_items enable row level security;

create policy "Follows are viewable by everyone" on follows for select using (true);
create policy "Users can follow others" on follows for insert to authenticated with check (auth.uid() = follower_id);
create policy "Users can unfollow others" on follows for delete to authenticated using (auth.uid() = follower_id);

create policy "Public lists are viewable by everyone" on lists for select using (not is_private or auth.uid() = owner_id);
create policy "Users can insert their own lists" on lists for insert to authenticated with check (auth.uid() = owner_id);
create policy "Users can update their own lists" on lists for update to authenticated using (auth.uid() = owner_id);
create policy "Users can delete their own lists" on lists for delete to authenticated using (auth.uid() = owner_id);
create policy "Users can delete their own likes" on list_likes for delete to authenticated using (auth.uid() = user_id);

-- Computed columns for Lists
create or replace function likes_count(lists) returns bigint as $$
  select count(*)::bigint from list_likes where list_id = $1.id;
$$ language sql stable;

create policy "List items are viewable if list is public" on list_items for select using (
  exists (
    select 1 from lists
    where lists.id = list_items.list_id and (not lists.is_private or lists.owner_id = auth.uid())
  )
);
create policy "Users can insert into their own lists" on list_items for insert to authenticated with check (
  exists (
    select 1 from lists
    where lists.id = list_items.list_id and lists.owner_id = auth.uid()
  )
);
create policy "Users can update items in their own lists" on list_items for update to authenticated using (
  exists (
    select 1 from lists
    where lists.id = list_items.list_id and lists.owner_id = auth.uid()
  )
);
create policy "Users can delete items in their own lists" on list_items for delete to authenticated using (
  exists (
    select 1 from lists
    where lists.id = list_items.list_id and lists.owner_id = auth.uid()
  )
);

-- Milestone 4: Discover Something New

create table if not exists video_tags (
  video_id text references videos(id) on delete cascade,
  tag text not null,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (video_id, tag, user_id)
);

create table if not exists channels (
  id text primary key,
  name text not null,
  thumbnail_url text,
  updated_at timestamptz default now()
);

alter table videos add column if not exists channel_id text references channels(id);

alter table video_tags enable row level security;
alter table channels enable row level security;

create policy "Video tags are viewable by everyone" on video_tags for select using (true);
create policy "Users can insert their own tags" on video_tags for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can delete their own tags" on video_tags for delete to authenticated using (auth.uid() = user_id);

create policy "Channels are viewable by everyone" on channels for select using (true);
create policy "Authenticated users can insert channels" on channels for insert to authenticated with check (true);
create policy "Authenticated users can update channels" on channels for update to authenticated using (true);

-- Notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,   -- recipient
  type text not null,  -- 'new_follower' | 'list_liked'
  actor_id uuid references profiles(id) on delete set null, -- who triggered it
  entity_id text,      -- list_id, video_id, or null depending on type
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Index for fast unread count queries
create index notifications_user_unread on notifications(user_id, is_read) where is_read = false;

-- Realtime needs to be enabled for notifications
alter publication supabase_realtime add table notifications;

alter table notifications enable row level security;
create policy "Users read own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on notifications for update using (auth.uid() = user_id);
create policy "Users delete own notifications" on notifications for delete using (auth.uid() = user_id);

-- Trigger: New Follower
create or replace function handle_new_follow()
returns trigger as $$
begin
  insert into notifications (user_id, type, actor_id, entity_id)
  values (NEW.following_id, 'new_follower', NEW.follower_id, null);
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_new_follow
  after insert on follows
  for each row execute function handle_new_follow();

-- Trigger: List Liked
create or replace function handle_new_list_like()
returns trigger as $$
declare
  v_owner_id uuid;
begin
  select owner_id into v_owner_id from lists where id = NEW.list_id;
  
  -- Don't notify if the user likes their own list
  if v_owner_id != NEW.user_id then
    insert into notifications (user_id, type, actor_id, entity_id)
    values (v_owner_id, 'list_liked', NEW.user_id, NEW.list_id);
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_new_list_like
  after insert on list_likes
  for each row execute function handle_new_list_like();
