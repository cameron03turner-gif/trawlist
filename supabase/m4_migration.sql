-- Milestone 4 Migration: Discover Something New

-- Community tags
CREATE TABLE video_tags (
  video_id text references videos(id) on delete cascade,
  tag text not null,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (video_id, tag, user_id)
);

-- Channel metadata (denormalised for performance)
CREATE TABLE channels (
  id text primary key, -- youtube channel handle or ID
  name text not null,
  thumbnail_url text,
  updated_at timestamptz default now()
);

-- Add channel relation to videos
ALTER TABLE videos ADD COLUMN channel_id text references channels(id);

-- RLS for tags (Public read, authenticated user can insert/delete their own tags)
ALTER TABLE video_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Video tags are viewable by everyone" ON video_tags FOR SELECT USING (true);
CREATE POLICY "Users can insert their own tags" ON video_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tags" ON video_tags FOR DELETE USING (auth.uid() = user_id);

-- RLS for channels (Public read, authenticated can insert/update)
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Channels are viewable by everyone" ON channels FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert channels" ON channels FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update channels" ON channels FOR UPDATE USING (auth.role() = 'authenticated');
