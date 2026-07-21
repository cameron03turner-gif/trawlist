# Scrubbed — Product Roadmap: Milestones 5–7

**Context**: Milestones 1–4 are complete. The core product is built — profiles, social graph, activity feed, lists, stats, channel pages, recommendations, community tags, and a landing page are all shipped. The next three milestones focus on **depth, habit formation, and reach**.

**Goal**: Turn a feature-complete product into one that retains strangers, creates daily habits, and earns word-of-mouth through genuine usefulness.

**Design philosophy**: Same as M1–M4 — ship features and polish together. No milestone should leave a rough edge visible to real users.

---

## How to read this roadmap

Each milestone has a **theme**, a set of **deliverables**, and a defined **evaluation gate** — a moment to pause, gather feedback, and decide whether to continue as planned, resequence, or pivot. No milestone should begin until the previous gate has been assessed.

Schema changes are **batched per milestone** to minimise migrations.

---

## Milestone 5 — "Finish What We Started"

> **Theme**: Close the gaps that exist just below the surface. The core features are built, but several have rough edges or missing pieces that prevent the product from feeling truly complete. This milestone is about making the existing experience feel *finished* before building anything new.

M5 requires **no new schema** — everything here is built on top of what already exists. It's the polish milestone the product deserves before expanding outward.

### Features

#### ⚙️ Settings & Profile Editing

The onboarding flow lets users set a username once. After that, there is currently no clear path to update their profile. This must be fixed.

- **Edit profile** from the Settings page (`/settings`):
  - Display name
  - Bio
  - Avatar (image upload to Supabase Storage, or URL paste)
  - Username (with collision check and a clear warning about URL change)
- **Account section**: Email display, sign-out button
- **Danger zone**: Delete account (soft delete or full cascade)
- The Settings link in the navbar already exists — this milestone makes it a real destination

#### 👥 Followers & Following List Pages

The profile header shows follower and following counts, but clicking them does nothing. For social graphs to be useful for discovery, users need to be able to browse who follows who.

- `/u/[username]/followers` — paginated list of users who follow this profile
- `/u/[username]/following` — paginated list of users this profile follows
- Each entry: avatar, display name, `@username`, and a Follow/Unfollow button (for the viewing user)
- Link the counts in the profile header to their respective pages
- "No followers yet" / "Not following anyone yet" empty states with a suggestion to explore the community

#### 💬 Reviews Surfaced in the Video Detail Modal

The `review` column exists on every rating row, and users can write reviews when logging a video. However, community reviews are not yet prominently surfaced anywhere in the UI. The `VideoDetailModal` is the right place for this.

- Show a **"Reviews" section** inside the video detail modal beneath the rating distribution bar
- Each review entry: user avatar, `@username`, their star rating, the review text, and the timestamp
- Sort by most recent by default; a toggle for "Top" (most stars)
- Show the viewing user's own review at the top if they've written one, with an Edit button
- **"Be the first to review this"** CTA when no reviews exist yet
- Cap initial display at 5 reviews with a "Show all" expand

#### 🎨 Empty State Polish Pass

Several pages still have minimal or off-brand empty states. Each empty state should use a relevant icon, a human-readable message, and a clear call-to-action. Pages to update:

| Page | Current state | Target |
|---|---|---|
| Profile log (no ratings) | Plain text | Icon + "Rate your first video" CTA |
| Watchlist (empty) | Plain text | Icon + "Add something to watch later" CTA |
| Lists tab (no lists) | `bg-neutral-900/50` (wrong colour) | `bg-surface border-amber` + "Create your first list" CTA |
| Community feed (no follows) | Basic message | Icon + "Follow some friends to see their activity" + link to leaderboard |
| "You Might Like" (no ratings) | Basic message | Icon + explanation of how recommendations work |
| "Popular in Network" (no follows) | Basic message | Icon + "Follow people to see what they're watching" |

> [!NOTE]
> The lists page currently uses `bg-neutral-900/50` and `border-neutral-800` which violates the design system rules. This must be corrected to use `bg-surface` and `border-amber`.

### Schema changes

None — this milestone is built entirely on the existing schema.

### Success criteria

- Users can edit their display name, bio, avatar, and username from `/settings`
- Clicking follower/following counts on a profile navigates to a list page
- The video detail modal shows community reviews with the reviewing user's identity
- All six identified empty states have been replaced with icon + CTA designs using correct design-system colours

---

### 🚦 Evaluation Gate 5

**Questions to ask before proceeding to M6:**

1. Are users updating their profiles after onboarding? (indicates the settings page is being discovered and used)
2. Are users clicking through to follower/following list pages? (indicates the social graph is becoming a discovery tool)
3. Are reviews being read and written at a higher rate now they're prominent? (check if the review field in ratings is being used more often)
4. Do any of the empty states feel jarring or misaligned with the brand?

**Decision point**: M5 has no risk of backfire — it's pure polish. Proceed to M6 regardless, but note any UX issues raised by the empty state redesign for a follow-up.

---

## Milestone 6 — "Build the Habit Loop"

> **Theme**: Turn Scrubbed from a tool you use occasionally into one you reach for habitually. This milestone introduces the three features most likely to drive **return visits and daily engagement**: auto-scrobbling from the extension, an in-app notification system, and data export as a trust and ownership signal.

This is the most strategically important milestone. The extension auto-scrobble is Scrubbed's single largest competitive moat — no web-only competitor can replicate it. Shipping it here, before Youboxd builds their own extension, is the priority.

### Features

#### 🔌 Extension: Auto-Scrobble & End-of-Video Rating Prompt

The browser extension currently requires the user to open its popup and manually paste a URL or click rate. This milestone makes the extension **proactive**.

- **Detect video completion**: Listen for the YouTube player's `ended` event on `youtube.com/watch` pages
- **Prompt overlay**: When a video ends, show a compact non-intrusive overlay in the bottom-right corner of the page:
  - Video thumbnail + title (already on the page)
  - Star rating picker (the same half-star scrubber from the web app)
  - "Skip" / "Rate Later" dismiss options
  - Submitting saves the rating directly to Supabase via the extension's authenticated session
- **Watchlist context**: If the video is already in the user's "Want to Watch" list, the prompt says *"You wanted to watch this — how was it?"* and marks it as watched on submit
- **Already rated**: If the user has already rated this video, the overlay instead shows their existing rating with an "Edit" option — never shows a blank prompt for something they've already reviewed
- **Respect preferences**: A toggle in the extension popup to enable/disable the auto-prompt (on by default)
- **Auth state**: If the user isn't signed in, the prompt is a sign-in nudge, not a full rate form

> [!IMPORTANT]
> This feature makes logging essentially frictionless. Users no longer need to remember to open Scrubbed — the extension meets them at the moment of consumption. This is Trakt's core mechanism applied to YouTube, and it is Scrubbed's clearest differentiator.

#### 🔔 In-App Notifications

As the social graph grows, users need to know when things happen that involve them. This milestone introduces a lightweight notification system — no email required in the first version.

**Trigger events:**
- Someone follows you
- Someone likes your list
- A video you've watchlisted gets rated by 5+ community members (weekly digest cadence, not per-rating)

**Implementation:**
- `notifications` table (see schema below)
- A **notification bell icon** in the navbar, with an unread count badge
- `/notifications` page showing the notification feed, with "Mark all as read"
- Each notification links to the relevant profile, list, or video
- Notifications are generated server-side (via Supabase database triggers or a lightweight API route called on the relevant action)
- No push notifications or email in M6 — in-app only

**What is intentionally excluded from M6:**
- "Someone rated a video you rated" (too noisy at scale)
- "New review on a video you rated" (deferred — could be spammy)
- Email digest (deferred to M7 or later)

#### 📤 Export Ratings (CSV & JSON)

A trust and data-ownership feature that costs little to build and meaningfully increases user confidence in committing to the platform.

- A button in `/settings` under a "Your Data" section: **"Export my ratings"**
- Two format options: CSV and JSON
- **CSV export** includes: `video_title`, `channel`, `youtube_url`, `rating`, `watch_status`, `review`, `note`, `tags`, `logged_at`
- **JSON export** includes the same fields plus nested metadata (`channel_id`, `video_id`)
- Generated server-side as a file download (no external storage required)
- "Last exported" timestamp shown in settings

> [!TIP]
> Data export signals that Scrubbed respects user ownership. Users who know they can leave take that as a reason to stay.

### Schema changes (batched)

```sql
-- Notifications
CREATE TABLE notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,   -- recipient
  type text not null,  -- 'new_follower' | 'list_liked' | 'video_trending'
  actor_id uuid references profiles(id) on delete set null, -- who triggered it
  entity_id text,      -- list_id, video_id, or null depending on type
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Index for fast unread count queries
CREATE INDEX notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- RLS: users can only read and update their own notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
```

### Success criteria

- The extension detects video completion and shows a rating prompt within 2 seconds of the video ending
- The prompt is dismissable without rating and respects the "already rated" state
- The notification bell appears in the navbar for signed-in users and shows an accurate unread count
- Follow and list-like events generate notifications for the recipient
- Users can export all their ratings as CSV and JSON from the settings page
- The export contains all required fields and downloads correctly

---

### 🚦 Evaluation Gate 6

**Questions to ask before proceeding to M7:**

1. **Extension prompt**: What percentage of video completions result in a rating submission? (target: >20% of completions for logged-in users)
2. **Extension prompt**: What is the skip/dismiss rate? If >80%, the prompt is too intrusive and needs redesigning
3. **Notifications**: Are users clicking through from notifications to the relevant content? (measures notification quality)
4. **Export**: Is the export being used? (proxy for users who are serious enough about their data to want a backup)
5. Has the auto-scrobble meaningfully increased total rating volume?

**Decision point**: If the auto-scrobble prompt is being skipped at a very high rate, reconsider the prompt's timing or design (e.g. opt-in vs opt-out, delay after video ends, less intrusive placement). If notification engagement is low, delay expanding notification types until the root cause is understood.

---

## Milestone 7 — "Go Deeper"

> **Theme**: Add the features that make Scrubbed genuinely irreplaceable for power users — a permanent home for every video, a personal diary of watching history, and a path for long-time YouTube users to bring their entire history into Scrubbed. This milestone completes the transition from a social tracker to a personal archive.

### Features

#### 🎬 Dedicated Video Pages (`/videos/[videoId]`)

Currently, video detail is a modal (`VideoDetailModal`). This works for in-app browsing but has two significant limitations: the URL doesn't change (not shareable), and it's invisible to search engines.

A permanent page per video makes each rated video a **shareable, indexable destination**.

- Route: `/videos/[videoId]` (e.g. `/videos/dQw4w9WgXcQ`)
- **Page content:**
  - Video thumbnail (large, prominent), title, channel name (linked to `/channel/[id]`)
  - Community average rating + total ratings count + rating distribution bar
  - Embedded YouTube player (using `youtube-nocookie.com` for privacy)
  - "Rate this video" button → opens `RateModal` pre-filled with the URL
  - Full community reviews feed (paginated, not capped)
  - Sidebar: other videos from the same channel that have been rated on Scrubbed
- **SEO**: Proper `<title>`, `<meta description>`, and Open Graph tags generated from video metadata
- **The modal remains** for in-app navigation (no regressions) — the video page is an *additional* route, not a replacement
- `VideoDetailModal` gets a "View full page →" link that navigates to the permanent URL

> [!NOTE]
> Video pages are the feature most likely to bring in organic traffic. When a user shares a Scrubbed link to a specific video, the recipient lands on a proper page — not the homepage.

#### 📅 Diary View — Date-Based Log

Letterboxd's diary is one of its most beloved features: a personal, chronological record of what you watched and when. Scrubbed's log is currently in reverse-chronological order without date grouping.

- Route: `/u/[username]/diary` — a new tab on the profile page
- **Calendar-grouped view**: Entries grouped by month, then by day within the month
  - Each day shows a compact row of video thumbnails with their ratings
  - Clicking a day expands to show full video cards with title, channel, and review snippet
- **Month navigation**: Previous/next month arrows; current month shown by default
- **"On this day" variant** (stretch goal for own profile): Show what you watched on this day in previous years
- The existing `/u/[username]/log` tab remains — the diary is an alternative *presentation* of the same data, not a new data source
- The stats page heatmap links to diary dates — clicking a heatmap cell navigates to that day in the diary

> [!TIP]
> The diary is a **retention and identity feature**. Users who see their watching history presented as a personal timeline feel ownership over the platform in a way that a simple list doesn't achieve.

#### 📥 YouTube Watch History Import

The single highest-effort feature in M5–M7, but the one with the greatest potential to onboard power users. People who've been watching YouTube for years have a rich history that's currently trapped in Google Takeout.

**How it works:**
1. User downloads their **Google Takeout** archive (`watch-history.json` or `watch-history.html`)
2. On `/settings`, a new "Import History" section lets them upload this file
3. Scrubbed parses the file **client-side** (never sent to the server in raw form — privacy-first)
4. The parser extracts: `video_id`, `title`, `channel_name`, `watched_at` timestamp
5. Videos are bulk-inserted as **unrated `watched` entries** — they appear in the log with no star rating, just a "watched" status
6. The user is then presented with a **"Rate your history"** flow: a paginated list of their imported videos, letting them retrospectively rate them

**Technical constraints:**
- Google Takeout format changed in 2023 — support both the JSON (`watch-history.json`) and older HTML format
- YouTube's oEmbed API rate limits mean we **cannot** look up all imported videos immediately — titles and channels come from the Takeout file itself; thumbnails are fetched lazily from `i.ytimg.com` using the video ID
- Deleted or private videos in the history will fail silently (log the failure, skip, notify user how many were skipped)
- Maximum import size: 10,000 entries (soft cap with a warning; larger histories can be split)
- Duplicate detection: don't create a second row if a video is already in the user's ratings

> [!WARNING]
> The import is a one-time bulk operation. Implement it with a preview step ("We found 847 videos — import them?") before writing to the database. A dry-run mode that shows a sample is strongly recommended before the final commit.

### Schema changes (batched)

```sql
-- Track import jobs for status and feedback
CREATE TABLE import_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  source text not null default 'google_takeout',
  status text not null default 'pending',  -- 'pending' | 'processing' | 'complete' | 'failed'
  total_videos int,
  imported_count int,
  skipped_count int,
  error_message text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- RLS: users can only see their own import jobs
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own import jobs" ON import_jobs
  FOR SELECT USING (auth.uid() = user_id);
```

> [!NOTE]
> No schema changes are needed for video pages (uses existing `videos` + `ratings` tables) or the diary view (a new presentation of existing `ratings` data). The `import_jobs` table is the only new addition in M7.

### Success criteria

- `/videos/[videoId]` pages load correctly, show community ratings and reviews, and include proper SEO meta tags
- The YouTube player embeds and plays inline on the video page
- The diary tab appears on profiles and correctly groups ratings by day and month
- Month navigation works; clicking a heatmap cell on the stats page navigates to the correct diary day
- The import flow accepts a Google Takeout file, parses it client-side, previews the results, and bulk-inserts on confirmation
- Imported entries appear in the log with `watched` status and no rating
- The "Rate your history" flow surfaces imported unrated items for retrospective rating

---

### 🚦 Evaluation Gate 7

**Questions to ask after M7:**

1. **Video pages**: Are video page URLs being shared externally? Is there any organic search traffic to `/videos/[id]` pages?
2. **Diary**: Is the diary tab being visited? Do users prefer it to the standard log view?
3. **Import**: How many users complete the full import flow? What is the drop-off rate at each step (upload → preview → confirm)?
4. **Import → rating**: Of users who imported history, what percentage go on to retrospectively rate imported videos within 7 days?
5. **Overall**: Has M6+M7 together meaningfully increased daily active user counts or session lengths?

**Decision point**: After M7, Scrubbed will have a feature set that genuinely exceeds Letterboxd's core offering in the YouTube context — with auto-scrobbling, import, dedicated video pages, and a full stats suite. The next strategic question is **growth**: Chrome Web Store editorial placement for the extension, SEO strategy for video pages, social sharing of stats cards, or a monetisation tier.

---

## Milestone Summary

| Milestone | Theme | Core Deliverables | Schema Changes |
|---|---|---|---|
| **M5** | Finish What We Started | Settings/profile edit, followers/following pages, reviews in detail modal, empty state polish | None |
| **M6** | Build the Habit Loop | Extension auto-scrobble, in-app notifications, ratings export (CSV/JSON) | `notifications` |
| **M7** | Go Deeper | Dedicated video pages, diary view, YouTube watch history import | `import_jobs` |

> [!NOTE]
> M5 is deliberately low-risk — it requires no schema changes and closes gaps that already exist. M6 is the highest-leverage milestone strategically. M7 is the deepest investment and the one most likely to create long-term, power-user loyalty.

---

## Feature Backlog (Post-M7)

Features identified in the market research and next-features analysis that are deliberately deferred:

| Feature | Rationale for deferral |
|---|---|
| Taste compatibility score ("You match 87% with @user") | Needs significant shared rating volume between users to be meaningful |
| Predicted rating ("We think you'd rate this 4.2★") | Same — needs data density; SQL similarity works but needs scale |
| Playlist / series tracking | YouTube-specific niche; defer until core use cases are solid |
| Email notification digest | In-app notifications (M6) come first; email adds delivery complexity |
| Push notifications (browser/mobile) | After in-app notifications are validated |
| Native mobile app | Ambitious scope; PWA / mobile web first |
| Monetisation / Pro tier | Revisit after M7 — advanced stats, extended history, export as natural Pro features |
| Dark/light mode toggle | Currently dark-only; could be added at any point if there's demand |
| Chrome Web Store editorial submission | Growth strategy — prioritise after M6 auto-scrobble is stable |
