-- Milestone 4: Discovery RPCs

-- 1. Popular in Your Network
-- Returns videos highly rated recently by people you follow
create or replace function get_network_popular_videos(p_user_id uuid, p_limit int default 10)
returns table (video_id text, title text, channel text, thumbnail_url text, channel_thumbnail_url text, url text, rating_count bigint, avg_rating numeric) as $$
  select 
    v.id as video_id, 
    v.title, 
    v.channel, 
    v.channel_id,
    v.thumbnail_url, 
    c.thumbnail_url as channel_thumbnail_url,
    v.url,
    count(r.rating) as rating_count, 
    avg(r.rating) as avg_rating
  from ratings r
  join follows f on f.following_id = r.user_id
  join videos v on v.id = r.video_id
  left join channels c on c.id = v.channel_id
  where f.follower_id = p_user_id
    and r.rating is not null
  group by v.id, c.thumbnail_url
  having count(r.rating) > 0
  order by rating_count desc, avg_rating desc nulls last
  limit p_limit;
$$ language sql security definer;

-- 2. Taste-Based Recommendations (You Might Like)
-- Simple collaborative filtering: users who gave 4+ stars to videos you gave 4+ stars to
create or replace function get_taste_based_recommendations(p_user_id uuid, p_limit int default 10)
returns table (video_id text, title text, channel text, thumbnail_url text, channel_thumbnail_url text, url text, rec_score bigint, avg_rating numeric) as $$
  with my_likes as (
    select video_id from ratings where user_id = p_user_id and rating >= 4.0
  ),
  similar_users as (
    select r.user_id, count(*) as similarity
    from ratings r
    join my_likes ml on ml.video_id = r.video_id
    where r.user_id != p_user_id and r.rating >= 4.0
    group by r.user_id
  )
  select 
    v.id as video_id,
    v.title, 
    v.channel, 
    v.channel_id,
    v.thumbnail_url, 
    c.thumbnail_url as channel_thumbnail_url,
    v.url,
    sum(su.similarity) as rec_score,
    avg(r.rating) as avg_rating
  from ratings r
  join similar_users su on su.user_id = r.user_id
  join videos v on v.id = r.video_id
  left join channels c on c.id = v.channel_id
  left join ratings my_r on my_r.video_id = r.video_id and my_r.user_id = p_user_id
  where my_r.video_id is null -- Exclude videos I have already rated
    and r.rating >= 4.0 -- They liked it
  group by v.id, c.thumbnail_url
  order by rec_score desc, avg_rating desc
  limit p_limit;
$$ language sql security definer;
