create table if not exists review_likes (
    user_id uuid references profiles(id) on delete cascade,
    rating_id uuid references ratings(id) on delete cascade,
    created_at timestamptz default now(),
    primary key (user_id, rating_id)
);

alter table review_likes enable row level security;

create policy "Users can view all review_likes" on review_likes
    for select using (true);

create policy "Users can insert their own review_likes" on review_likes
    for insert with check (auth.uid() = user_id);

create policy "Users can delete their own review_likes" on review_likes
    for delete using (auth.uid() = user_id);
