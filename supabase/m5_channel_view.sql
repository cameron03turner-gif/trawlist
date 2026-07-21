-- m5_channel_view.sql
-- Update video_leaderboard view to include channel_thumbnail_url

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
group by v.id, c.thumbnail_url
order by avg_rating desc;
