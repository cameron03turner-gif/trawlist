# Market Research: Scrubbed vs Competitors

## Executive Summary

Scrubbed — a YouTube video rating and logging platform — occupies a **genuinely underserved niche**. No established "Letterboxd for YouTube" exists despite clear demand signals (Notion templates, Google Sheets trackers, Reddit curation communities). This is a significant opportunity, but to capitalise on it, Scrubbed needs to close substantial feature and polish gaps relative to adjacent content-tracking platforms.

Five competitor categories were researched:

| Platform | Domain | Rating Scale | Users | Relevance |
|---|---|---|---|---|
| **Youboxd** | YouTube | Stars + reviews | Early-stage | ⚠️ Direct competitor |
| **Favoree** | YouTube channels | 1–5 stars + tags | Growing | Channel-level competitor |
| **Letterboxd** | Films | ½-star (0.5–5) | 30M+ | Gold standard for UX |
| **Criticker** | Films/TV/Games | 0–100 numeric | Niche | Best recommendation algo |
| **RateYourMusic** | Music | ½-star (0.5–5) | Large niche | Best charts/filtering |
| **Trakt.tv** | TV/Film | 5-star (10-pt internal) | Large | Best stats/auto-tracking |
| **Serializd** | TV | ½-star (0.5–5) | Growing | Best modern UI polish |
| **YouTube extensions** | YouTube | Varies | Varies | Fragmented, solo-use |

---

## ⚠️ Direct YouTube Competitors

### Youboxd (youboxd.com) — Closest Threat

Explicitly positioned as **"Letterboxd for YouTube"**. This is the most direct competitor to Scrubbed.

| Feature | Youboxd | Scrubbed |
|---|---|---|
| Paste-a-link rating | ✅ | ✅ |
| Written reviews | ✅ | ❌ |
| Curated lists | ✅ (by mood, topic) | ❌ |
| Follow users | ✅ | ❌ |
| Human-first discovery | ✅ (no algorithms) | ❌ |
| Gamification (streaks, points) | ✅ | ❌ |
| Watch history tracking | ✅ | ✅ (log) |
| Browser extension | ❌ (unknown) | ✅ |
| Community leaderboard | ❌ (unknown) | ✅ |

> [!WARNING]
> Youboxd appears to be early-stage but is pursuing the exact same vision as Scrubbed. Scrubbed's **browser extension** and **community leaderboard** are differentiators today, but Youboxd's social features (follows, lists, reviews, gamification) represent the feature depth Scrubbed currently lacks.

### Favoree (favoree.io) — Channel-Level Complement

Positioned as **"IMDb for YouTube Channels"** — rates channels, not individual videos.

| Feature | Details |
|---|---|
| Rating target | Channels (not videos) |
| Rating system | 1–5 stars + qualitative tags |
| Qualitative tags | Trustworthy, Funny, Instructional, Relaxing, Complex, Kid-friendly |
| Channel discovery | Search/filter by topic, mood, video length, rating |
| Written reviews | ✅ For channels |
| Community picks | "Channel of the Week" |
| In-site video playback | ✅ |
| Analytics | Channel growth data via YouTube API |

> [!TIP]
> Favoree is complementary rather than competitive — it rates channels while Scrubbed rates individual videos. A potential synergy: Scrubbed could add **channel-level aggregation** (average of all video ratings for a channel) to naturally compete with Favoree while offering deeper per-video granularity.

### YouTube Rating Extensions (Fragmented Market)

| Extension | What it does | Limitation |
|---|---|---|
| **YouTube Star Rating** | 1–5 stars on YouTube pages | Solo-use, no community |
| **YouTube Rating Extension** | 1–10 numeric | Solo-use, no social |
| **Return YouTube Dislike** | Restores dislike count | Binary only, no custom rating |
| **YouTube Dislike from Comments** | AI sentiment from comments | No personal rating |
| **OutlierKit** | "Outlier score" on thumbnails | Performance metric, not subjective |

None of these combine personal rating + community aggregation + social features. They are all solo-use tools with no profiles, no persistence beyond the browser, and no social layer.

### YouTube Watch History / Organisation Tools

| Tool | Type | Gap vs Scrubbed |
|---|---|---|
| **Watchmarker** | Marks watched videos visually | No rating, no community |
| **YouTube Watch Stats** | Watch time dashboard | No rating, no social |
| **PocketTube** | Channel subscription folders | Organisation only |
| **YiNote / Annotate.tv** | Timestamped notes on videos | Annotation, not rating |
| **Notion / Sheets templates** | Manual DIY logging | Proves demand; no community |

> [!IMPORTANT]
> The existence of Notion templates and Google Sheets for YouTube logging proves **real user demand** for the concept. These users are Scrubbed's ideal early adopters — people who already care enough to manually track their viewing but lack a purpose-built tool.

---

## Current Scrubbed Feature Inventory

| Feature | Status |
|---|---|
| Paste-a-link video lookup (oEmbed) | ✅ |
| Star rating (0–5, 0.5 increments) | ✅ |
| Personal log (chronological) | ✅ |
| Delete rating from log | ✅ |
| Community leaderboard (avg rating) | ✅ |
| Magic link auth (email) | ✅ |
| Browser extension (in-page rating widget) | ✅ |
| Dark mode UI | ✅ |
| Responsive layout | ✅ |

---

## Feature Gap Analysis

### 🔴 Critical Missing Features (every competitor has these)

| Feature | What competitors do | Impact |
|---|---|---|
| **Social graph (follow/followers)** | Letterboxd, Trakt, Serializd all have follow systems with activity feeds showing what friends rated/watched | High retention & virality driver |
| **User profiles** | Rich profile pages with avatar, bio, favourites, stats, rating history | Identity & engagement |
| **Personal statistics & analytics** | Rating distribution histogram, total videos watched, hours viewed, top channels, genre breakdown, year-in-review | #1 retention feature per Trakt's model |
| **Search & filter on leaderboard** | Filter by channel, category, date range, rating count; sort by avg rating, recency, popularity | Leaderboard is unusable at scale without this |
| **Watch status tracking** | "Want to watch" / "Watching" / "Watched" / "Dropped" statuses | Table-stakes for content tracking |
| **Text reviews / notes** | Optional short or long-form review alongside rating | Adds depth, drives community engagement |

### 🟡 Important Missing Features (most competitors have these)

| Feature | What competitors do | Impact |
|---|---|---|
| **User-created lists / collections** | Ranked or unranked themed lists ("Best Tech Reviews", "Comfort Watches") | Discovery + user expression |
| **Rating distribution graph** | Per-video display of how the community distributed ratings | Trust & engagement signal |
| **Diary / date-based logging** | Log *when* you watched something, not just *that* you watched it; calendar view | Personal history richness |
| **Recommendations / "You might like"** | Taste-based suggestions from users with similar ratings (Criticker's TCI model) | Discovery & retention |
| **Comments on videos / reviews** | Community discussion on individual items | Engagement |
| **Likes on reviews & lists** | Social engagement signals | Community building |
| **Import / export** | Import YouTube watch history, export ratings as CSV/JSON | Onboarding & data ownership |

### 🟢 Nice-to-Have Features (differentiators from top competitors)

| Feature | Inspiration | Impact |
|---|---|---|
| **Community tags / descriptors** | RYM's "dreamy", "lo-fi", "educational" mood/genre tags | Mood-based discovery |
| **Taste compatibility score** | Criticker's TCI — "You and @user have 87% taste match" | Social discovery |
| **Predicted rating** | "Based on similar users, you'd rate this ≈ 4.2" | Powerful recommendation hook |
| **Auto-scrobbling via extension** | Trakt auto-detects what you watch; Scrubbed's extension could auto-log | Frictionless logging |
| **Favourite videos banner** | Letterboxd's 4-favourite-films profile header | Identity / expression |
| **Year in review** | Letterboxd & Trakt's annual stats summary | Shareability / virality |
| **Playlist / series tracking** | Track progress through a YouTube playlist or creator's series | Unique to YouTube |
| **Channel-level aggregation** | Show average rating across all videos from a channel | Unique to YouTube |

---

## UI/UX Polish Assessment

### What Scrubbed Does Well
- **Dark colour scheme** (`#0F141F` background) — premium feel, on-trend
- **Amber accent** (`#E8B34D`) — distinctive and warm, sets it apart from Letterboxd's green or Serializd's purple
- **Good typography choices** — Space Grotesk display + Inter body + JetBrains Mono — a sophisticated stack
- **Star rating component** — half-star precision with hover preview, solid interaction

### Where Scrubbed Falls Short vs Competitors

| Area | Current State | Competitor Standard | Priority |
|---|---|---|---|
| **Content density** | Single-column, max-width 2xl (672px) | Letterboxd/RYM adapt to viewport with multi-column grids | Medium |
| **Thumbnail prominence** | Small thumbnails (140px rate, 96px log) | Letterboxd uses poster-sized images; Trakt uses full backdrop images | High |
| **Hover interactions** | Basic `brightness-110` on video rows | Letterboxd shows quick-action overlay (rate, like, watchlist) on hover | Medium |
| **Empty states** | Plain text ("Nothing logged yet") | Competitors use illustrations, call-to-action buttons, onboarding tips | Low |
| **Loading states** | Simple spinner | Competitors use skeleton screens matching content layout | Medium |
| **Animations & transitions** | Minimal (spin on loader, transition on hover) | Serializd has smooth page transitions, tactile rating interactions, micro-animations | Medium |
| **Onboarding** | Bare — just login, then an empty page | Letterboxd prompts you to rate some items, follow people, explains features | High |
| **Profile page** | None — just email in navbar | All competitors have rich profile pages as the centre of the experience | 🔴 Critical |
| **Landing / marketing page** | None — goes straight to rate form | Competitors have compelling landing pages explaining the value proposition | Medium |
| **Mobile UX** | Responsive but not optimised | Serializd is mobile-first; Letterboxd has native apps | Medium |
| **Video embed / preview** | Static thumbnail only | Could embed YouTube player inline for quick preview | Low |
| **Favicon / branding** | Default Next.js favicon | All competitors have distinctive favicons and brand identity | Low |

---

## Competitive Positioning Map

```
                    ┌─────────────────────────────────────┐
                    │         HIGH FEATURE DEPTH           │
                    │                                      │
                    │   RateYourMusic    Trakt.tv          │
                    │   (dense, data)    (stats, auto)     │
                    │                                      │
      LOW UI ───────┤        Criticker                     ├─── HIGH UI
      POLISH        │        (algo-strong,                 │    POLISH
                    │         dated UI)                     │
                    │                      Letterboxd      │
                    │                      (gold standard) │
                    │                                      │
                    │   Scrubbed ←              Serializd  │
                    │   (YOU ARE HERE)          (modern)    │
                    │                                      │
                    │         LOW FEATURE DEPTH             │
                    └─────────────────────────────────────┘
```

> [!IMPORTANT]
> Scrubbed currently sits in the **low-feature, medium-polish** quadrant. The path to success runs diagonally — improve both features and polish simultaneously. Criticker is the cautionary tale: best-in-class algorithms with dated UI ≠ mainstream adoption.

---

## Strategic Recommendations

### Phase 1 — Foundation (Address Critical Gaps)

These are the features that every successful content-tracking platform has. Without them, Scrubbed feels like a proof-of-concept rather than a product.

1. **User profile pages** — Avatar, display name, bio, favourite videos banner, rating history, stats
2. **Personal statistics** — Total videos rated, rating distribution chart, top channels, hours of content rated
3. **Search & filter on leaderboard** — Search by title/channel, sort by rating/recency/count
4. **Watch status** — Add "want to watch" / "watched" / "dropped" to the data model
5. **Onboarding flow** — After first login, prompt user to rate a few videos, set up profile

### Phase 2 — Social & Discovery

6. **Social graph** — Follow users, activity feed
7. **Reviews / notes** — Optional text alongside ratings
8. **User-created lists** — Themed, ranked or unranked collections
9. **Diary view** — Calendar-based log showing when you watched things
10. **Recommendations** — "Users who rated this highly also liked..."

### Phase 3 — Differentiation (YouTube-specific advantages)

11. **Channel-level pages** — Aggregate ratings per creator/channel
12. **Auto-scrobble via extension** — Detect when a video finishes and prompt to rate
13. **Playlist tracking** — Track progress through YouTube playlists or series
14. **Community tags** — User-applied tags for discovery ("educational", "funny", "essay")
15. **Year in review** — Annual stats summary (shareable, viral)
16. **YouTube watch history import** — Onboard users by importing their existing history

---

## Key Lessons from Each Competitor

### Letterboxd 🎬
> **Lesson**: The "four favourites" profile banner and diary metaphor make ratings *personal*. Users don't just rate — they express identity. Scrubbed should make the log feel like a personal space, not a database.

### Criticker 📊
> **Lesson**: Taste-matching algorithms (TCI) are the most powerful recommendation tool, far better than simple popularity sorting. But **features without polish = obscurity**. Criticker has the best algorithm and the smallest user base.

### RateYourMusic 🎵
> **Lesson**: Deep filtering and charting is the killer discovery feature. The ability to ask "what are the highest-rated comedy videos from 2025?" would be transformative for Scrubbed's leaderboard.

### Trakt.tv 📺
> **Lesson**: Auto-tracking (scrobbling) removes friction and drives habitual use. The stats dashboard is the #1 reason users keep coming back. **Stats are retention.**

### Serializd 📱
> **Lesson**: Modern UI polish is itself a competitive advantage. Serializd does less than Trakt but feels more premium. In a crowded space, **design quality is a differentiator**.

---

## The Opportunity

While Youboxd and Favoree prove there's market interest, **no platform has yet achieved dominance as "Letterboxd for YouTube"**. The space is nascent — Youboxd appears early-stage, and Favoree focuses on channels rather than individual videos. The window of opportunity is open but closing.

YouTube's removal of the dislike count in 2021 created latent demand for richer community rating signals. Extensions like "Return YouTube Dislike" (millions of users) prove that viewers want more than binary like/dislike. Scrubbed's 0.5–5 star system directly addresses this gap.

The addressable audience is enormous: YouTube has 2.7B monthly active users. Even capturing a tiny fraction of "power viewers" who care about tracking and rating would dwarf the user bases of niche platforms like Criticker or RateYourMusic.

### Scrubbed's Current Advantages Over Competitors

| Advantage | Details |
|---|---|
| **Browser extension** | In-page rating widget on YouTube — no copy/paste friction |
| **Community leaderboard** | Aggregated ratings with ranking — Youboxd may lack this |
| **Technical foundation** | Next.js + Supabase = scalable, modern stack |
| **Amber/dark design identity** | Distinctive visual brand |

### What Scrubbed Must Do to Win

1. **Close the social gap** — Youboxd has follows, lists, and reviews. Scrubbed needs these yesterday.
2. **Add stats dashboard** — The #1 retention driver across Trakt, Letterboxd, and AniList.
3. **Enhance the extension** — Auto-detect video completion → prompt rating. This is Scrubbed's biggest moat.
4. **Build profile pages** — Transform the log from a database into a personal identity.
5. **Enable channel-level views** — Aggregate ratings per creator to compete with Favoree's niche.

> [!TIP]
> **The winning formula**: Letterboxd's social + diary UX, Trakt's stats dashboard, Serializd's visual polish, Scrubbed's browser extension moat — applied to YouTube's massive audience. That's the product Scrubbed should become.
