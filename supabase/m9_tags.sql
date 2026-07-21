-- Milestone 4: Community Tags
CREATE TABLE video_tags (
  video_id text references videos(id) on delete cascade,
  tag text not null,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (video_id, tag, user_id)
);

-- Enable RLS
ALTER TABLE video_tags ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Video tags are viewable by everyone."
  ON video_tags FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own video tags."
  ON video_tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video tags."
  ON video_tags FOR DELETE
  USING (auth.uid() = user_id);
