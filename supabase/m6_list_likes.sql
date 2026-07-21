-- Milestone 6: List Likes

create table if not exists list_likes (
  user_id uuid references profiles(id) on delete cascade,
  list_id uuid references lists(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, list_id)
);

alter table list_likes enable row level security;

create policy "List likes are viewable by everyone" on list_likes for select using (true);
create policy "Users can insert their own likes" on list_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can delete their own likes" on list_likes for delete to authenticated using (auth.uid() = user_id);
