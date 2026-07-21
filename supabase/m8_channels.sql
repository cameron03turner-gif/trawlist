-- Milestone 4: Channel Pages & Leaderboard

-- 1. Update video_leaderboard to include channel_id
drop view if exists video_leaderboard cascade;
create or replace view video_leaderboard as
select
  v.id,
  v.title,
  v.channel,
  v.channel_id,
  v.thumbnail_url,
  v.url,
  avg(r.rating)::numeric(3,2) as avg_rating,
  count(r.rating) as rating_count,
  max(r.updated_at) as last_rated_at,
  c.thumbnail_url as channel_thumbnail_url
from videos v
left join channels c on v.channel_id = c.id
join ratings r on r.video_id = v.id
group by v.id, c.thumbnail_url
order by avg_rating desc;

-- 2. Create channel_leaderboard view
create or replace view channel_leaderboard as
select
  c.id,
  c.name,
  c.thumbnail_url,
  count(distinct v.id) as video_count,
  count(r.rating) as total_ratings,
  avg(r.rating)::numeric(3,2) as avg_rating
from channels c
join videos v on v.channel_id = c.id
join ratings r on r.video_id = v.id
group by c.id, c.name, c.thumbnail_url
having count(distinct v.id) >= 2
order by avg_rating desc, total_ratings desc;
