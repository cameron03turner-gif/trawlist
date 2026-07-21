# Scrubbed — Product Roadmap

**Goal**: Grow a real user base by building a compelling, polished "Letterboxd for YouTube" that can retain strangers and compete with early-stage direct competitors like Youboxd.

**Development model**: AI-assisted (Antigravity-driven builds).

**Design philosophy**: Ship features and polish together — each milestone should feel like a shippable, presentable product, not a work-in-progress.

---

## How to read this roadmap

Each milestone has a **theme**, a set of **deliverables**, and a defined **evaluation gate** — a moment to pause, gather feedback, and decide whether to continue as planned, resequence, or pivot. No milestone should begin until the previous gate has been assessed.

Schema changes are **batched per milestone** to minimise migrations.

---

## Milestone 1 — "A Place to Call Home"

> **Theme**: Transform Scrubbed from a rating tool into a product someone would tell a friend about. Give users a personal identity and make the existing experience feel polished and premium.

This milestone addresses the most glaring gap relative to competitors: the complete absence of a user identity layer. Right now, a signed-in user is just an email address in a navbar. After M1, they have a profile page they'd want to share.

### Features

#### 🆔 User Profiles
- Display name and avatar (initials-based default, upload optional)
- Short bio field
- "Favourite videos" banner — pin up to 4 videos (inspired by Letterboxd's iconic Top Four)
- Public profile URL: `/u/[username]`
- Username selection on first login (onboarding step)

#### 📊 Personal Stats (Basic)
- Total videos rated
- Rating distribution histogram (how many 1★, 2★, 3★, etc.)
- Top 5 most-rated channels
- Average rating (personal)
- These stats appear on the user's own profile

#### 🎨 UI/UX Polish Pass
- **Onboarding flow**: After first login, a welcome screen guides the user to set a display name and rate their first video
- **Richer video cards**: Larger thumbnails, channel pill/badge
- **Leaderboard search**: Filter by video title or channel name
- **Skeleton loading states** on log and leaderboard pages (replace plain spinner)
- **Empty state illustrations** with clear call-to-action (e.g. "You haven't rated anything yet — paste a link to start")
- **Favicon and page titles** per route (e.g. "My Log | Scrubbed", "Leaderboard | Scrubbed")

### Schema changes (batched)

```sql
-- New columns on profiles
ALTER TABLE profiles ADD COLUMN username text UNIQUE;
ALTER TABLE profiles ADD COLUMN display_name text;
ALTER TABLE profiles ADD COLUMN bio text;
ALTER TABLE profiles ADD COLUMN avatar_url text;

-- Favourite videos (up to 4, ordered)
CREATE TABLE profile_favourites (
  profile_id uuid references profiles(id) on delete cascade,
  video_id text references videos(id) on delete cascade,
  position int not null check (position between 1 and 4),
  primary key (profile_id, position)
);
```

### Success criteria

- A user can set a username, display name, bio, and pin favourite videos
- Profiles are publicly viewable at `/u/[username]`
- Stats appear on the profile page
- Leaderboard is searchable by title/channel
- Onboarding runs on first login and guides new users to a named profile

---

### 🚦 Evaluation Gate 1

**Questions to ask before proceeding to M2:**

1. Do users who reach the profile page come back? (measure return visit rate)
2. Is the onboarding flow completing (are users setting a username)?
3. Does the profile feel like a personal space worth sharing?
4. Are there usability issues with any M1 features to fix before adding more complexity?

**Decision point**: If profile pages aren't resonating or onboarding completion is low, consider iterating on M1 before building social features that depend on profiles being a compelling destination.

---

## Milestone 2 — "Something Worth Saying"

> **Theme**: Add depth and expression to the rating act. Give users more ways to engage with individual videos (reviews, notes, watch status) and give the leaderboard more signal. This is the "personal logging excellence" milestone — making solo use deeply satisfying before layering social on top.

### Features

#### 📝 Reviews & Notes
- Optional short-form review field when rating a video (no minimum, no maximum character limit — Letterboxd philosophy)
- Reviews are public and visible on the leaderboard video entry
- Edit and delete your own review
- Notes: a **private** text field for personal thoughts (not shown to others) — distinct from the public review

#### 👁️ Watch Status
- Four statuses: **Watched** (rated), **Want to Watch**, **Watching**, **Dropped**
- "Want to Watch" is a queue — a dedicated tab in the user's log
- Status can be set without rating (e.g. add to watchlist, or mark as dropped without a score)
- Extension: if a video is in the watchlist, the extension widget surfaces this as context ("You wanted to watch this")

#### 🔍 Leaderboard Enhancements
- **Sort options**: Average rating, Rating count, Most recently rated
- **Filter by minimum rating count** (e.g. "only show videos rated by 3+ people") — surfaces legitimate community consensus
- **Rating distribution bar** on each leaderboard entry (visual breakdown of how the community rated it)

#### 🎨 UI/UX Polish Pass
- **Video detail view / modal**: Click a leaderboard entry to expand it — shows full review list, rating distribution, channel info, and a "Rate this" button without leaving the page
- **Extension enhancement**: After the rating widget is submitted, show a prompt to write a quick review

### Schema changes (batched)

```sql
-- Reviews (public)
ALTER TABLE ratings ADD COLUMN review text;
-- Notes (private)
ALTER TABLE ratings ADD COLUMN note text;

-- Watch status
CREATE TYPE watch_status AS ENUM ('want_to_watch', 'watching', 'dropped');
-- Note: 'watched' is implicit from having a rating row

ALTER TABLE ratings ALTER COLUMN rating DROP NOT NULL;
-- rating is now nullable: null = status-only entry (no score yet)
-- A check: either rating IS NOT NULL or watch_status IS NOT NULL
ALTER TABLE ratings ADD COLUMN watch_status watch_status;
ALTER TABLE ratings ADD CONSTRAINT rating_or_status CHECK (
  rating IS NOT NULL OR watch_status IS NOT NULL
);
```

> [!IMPORTANT]
> Making `rating` nullable is the key schema change here. It allows watch-status-only entries (want to watch, watching, dropped) without a score. This is a meaningful change to the data model that should be done carefully with a migration script.

### Success criteria

- Users can write and edit reviews on their rated videos
- Users can maintain a private note separately from the public review
- "Want to Watch" queue is functional and visible in the log
- Leaderboard shows sorting options and rating distribution bars
- Video detail view/modal opens without a full page navigation

---

### 🚦 Evaluation Gate 2

**Questions to ask before proceeding to M3:**

1. Are users writing reviews, or is the field being ignored?
2. Is the "Want to Watch" list being used? Does it drive return visits?
3. Has the richer leaderboard (sorting, distribution) made it more useful and browsable?
4. Are there any data model issues with nullable ratings that need resolving?

**Decision point**: If reviews are rarely written, reconsider whether M3's social features (which surface reviews in feeds) are worth the complexity. If the watchlist is very popular, consider prioritising list/collection features in M3.

---

## Milestone 3 — "Find Your People"

> **Theme**: Add the social layer. Users can follow each other, see what the people they follow are rating, and create curated lists. This is the milestone that turns Scrubbed from a personal tool into a community platform.

Social features are deliberately placed at M3 because:
- Profiles (M1) must be compelling destinations before following is meaningful
- Reviews and status (M2) must exist for the activity feed to have interesting content

### Features

#### 👥 Social Graph
- Follow / unfollow any user (asymmetric, like Letterboxd / Twitter)
- Follower and following counts on profiles
- Followers and following lists accessible from the profile

#### 📰 Activity Feed
- New **"Following" tab** in the nav (or on the homepage)
- Chronological feed of what followed users are doing:
  - Rated a video (with their star rating)
  - Wrote a review
  - Added a video to their watchlist
  - Created a list
- Each feed item links to the video / user / list
- No algorithm — purely chronological, human-driven (same intentional choice as Letterboxd)

#### 📋 User-Created Lists
- Any user can create a named, themed list (e.g. "Best Tech Essays", "Relaxing Sunday Watching")
- Lists can be ranked (numbered) or unranked
- Lists are public by default, with an option for private
- Lists appear on the user's profile under a "Lists" tab
- A community **"Lists"** page shows recently created and popular lists

#### 🎨 UI/UX Polish Pass
- **Activity feed design**: Rich, scannable feed cards showing thumbnail + user action + rating/stars
- **Profile page tabs**: Full tab layout on profile (Ratings, Reviews, Lists, Watchlist, Stats)
- **"Following" vs "Community" leaderboard toggle**: Allow users to see a leaderboard filtered to only people they follow

### Schema changes (batched)

```sql
-- Follows
CREATE TABLE follows (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- Lists
CREATE TABLE lists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  is_ranked boolean default false,
  is_private boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TABLE list_items (
  list_id uuid references lists(id) on delete cascade,
  video_id text references videos(id) on delete cascade,
  position int,
  note text,
  added_at timestamptz default now(),
  primary key (list_id, video_id)
);

-- RLS policies for follows, lists, list_items (public read, owner write)
```

### Success criteria

- Users can follow each other and see a chronological feed of their activity
- User-created lists work end-to-end (create, add videos, view, share)
- Profile tabs are fully navigable (Ratings, Lists, Watchlist, Stats)
- "Following" leaderboard filter works

---

### 🚦 Evaluation Gate 3

**Questions to ask before proceeding to M4:**

1. Are users following each other? Is the follow graph growing?
2. Is the activity feed being visited regularly?
3. Are lists being created and shared?
4. Is the platform starting to feel like a community, or is it still primarily a solo tool?
5. Are there any performance issues with the feed or list queries at scale?

**Decision point**: If social features are driving engagement, M4's discovery and recommendation features will amplify that flywheel. If social isn't landing, consider whether the audience is primarily solo users and reprioritise M4 around better personal analytics and discovery instead.

---

## Milestone 4 — "Discover Something New"

> **Theme**: Close the discovery gap. Surface great videos users haven't seen, aggregate ratings at the channel level, and add deeper stats. This is the milestone that makes Scrubbed genuinely useful for finding things to watch — not just logging what you've already seen.

### Features

#### 🔍 Discovery
- **"You might like"** section on the homepage: videos rated highly by users with similar rating patterns to you (simplified taste-based recommendations — no ML needed, just SQL)
- **"Popular in your network"**: Videos trending among people you follow
- **Community tags**: User-applied descriptive tags on videos (e.g. "educational", "essay", "comedy", "relaxing") with tag-based filtering on the leaderboard

#### 📺 Channel Pages
- Aggregate all Scrubbed-rated videos by YouTube channel
- Channel page at `/channel/[channelId]` showing: channel name, average rating across all videos, top-rated videos, most recent ratings
- "Top Channels" leaderboard (ranked by average rating, minimum video count threshold)
- Leaderboard filter: filter by channel

#### 📊 Enhanced Stats Dashboard
- Full stats page at `/u/[username]/stats`
- **Rating distribution histogram** (expanded from M1 to full page)
- **Viewing timeline**: Calendar heatmap showing days with rating activity (GitHub-style)
- **Top channels**: Bar chart of most-rated and highest-average-rated channels
- **Genre/tag breakdown**: Distribution across community tags
- **Year-in-review section**: A shareable annual summary card (Spotify Wrapped-style)

#### 🎨 UI/UX Polish Pass
- **Landing / marketing page**: A compelling `/` route for signed-out visitors explaining Scrubbed's value proposition, with examples and a sign-up CTA (currently signed-out users just see the rate form)
- **Shareable stat cards**: PNG export of year-in-review summary for social sharing
- **Improved extension**: Auto-detect when a YouTube video ends and show a "Rate this video?" prompt

### Schema changes (batched)

```sql
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
  id text primary key, -- youtube channel id
  name text not null,
  thumbnail_url text,
  updated_at timestamptz default now()
);

ALTER TABLE videos ADD COLUMN channel_id text references channels(id);
```

### Success criteria

- "You might like" recommendations show on the homepage for signed-in users
- Channel pages are accessible and show aggregated video ratings
- Stats dashboard is fully built with all charts and the calendar heatmap
- Year-in-review card is shareable externally
- Landing page makes the Scrubbed value proposition clear to new visitors
- Extension shows end-of-video rating prompt

---

### 🚦 Evaluation Gate 4

**Questions to ask after M4:**

1. Is discovery (recommendations, channel pages, tags) driving new rating activity?
2. Are year-in-review cards being shared externally — bringing in new users?
3. Is the landing page converting visitors into sign-ups?
4. Has the extension auto-prompt meaningfully increased rating volume?
5. Is there genuine community growth, or is growth plateauing?

**Decision point**: After M4, Scrubbed will have a feature set broadly comparable to Letterboxd's core offering — applied to YouTube. The question becomes: **what is the growth strategy?** This is the natural point to evaluate monetisation (a Pro tier for advanced stats), a Chrome Web Store submission for the extension, or other growth levers.

---

## Feature Backlog (Post-M4)

Features that were identified in the market research but deliberately deferred — revisit after M4 evaluation:

| Feature | Rationale for deferral |
|---|---|
| Import YouTube watch history | Complex, dependent on YouTube API quotas |
| Export ratings as CSV | Easy win — add at any point |
| Taste compatibility score ("You match 87% with @user") | Requires significant rating volume to be meaningful |
| Predicted rating ("We think you'd rate this 4.2★") | Same — needs data density |
| Playlist / series tracking | YouTube-specific niche; defer until core use cases are solid |
| Monetisation / Pro tier | Per user preference — revisit after M4 |
| Native mobile app | Ambitious scope; PWA / mobile web first |
| Dark/light mode toggle | Currently dark-only; could be a quick M2/M3 addition if there's demand |

---

## Milestone Summary

| Milestone | Theme | Core Deliverables | Schema Changes |
|---|---|---|---|
| **M1** | A Place to Call Home | Profiles, basic stats, leaderboard search, UI polish, onboarding | `profiles` columns, `profile_favourites` |
| **M2** | Something Worth Saying | Reviews, notes, watch status, leaderboard enhancements | `ratings` review/note columns, watch status enum |
| **M3** | Find Your People | Social graph, activity feed, user lists | `follows`, `lists`, `list_items` |
| **M4** | Discover Something New | Recommendations, channel pages, full stats dashboard, landing page | `video_tags`, `channels`, `videos.channel_id` |

> [!NOTE]
> Each milestone is designed to be independently shippable and coherent. A user encountering Scrubbed after M1 should experience a complete, polished product — not a half-built one. The same is true after M2, M3, and M4.
