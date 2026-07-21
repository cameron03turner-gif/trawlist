import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gfsxhsztvufwywrfdatj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmc3hoc3p0dnVmd3l3cmZkYXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzUzNzMsImV4cCI6MjA5OTk1MTM3M30.OU12KPgXuh-yKZzRNQL-_RtvpvAQs0hFz7PTcIzGKu8'
);

async function check() {
  const { data: channels, error: e1 } = await supabase.from('channels').select('*');
  console.log('Channels:', channels, e1);
  
  const { data: videos, error: e2 } = await supabase.from('videos').select('id, title, channel_id');
  console.log('Videos:', videos, e2);
  
  const { data: ratings, error: e3 } = await supabase.from('ratings').select('video_id, rating');
  console.log('Ratings:', ratings, e3);
  
  const { data: leaderboard, error: e4 } = await supabase.from('channel_leaderboard').select('*');
  console.log('Channel Leaderboard:', leaderboard, e4);
}

check();
