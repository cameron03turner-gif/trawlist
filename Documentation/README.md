# Scrubbed

Rate every YouTube video you watch. Ratings save to your profile and roll up
into a community leaderboard. Built on Next.js + Supabase, both free at this
scale, plus a companion browser extension.

No YouTube API key needed anywhere — video titles/thumbnails come from
YouTube's public oEmbed endpoint when you paste a link, or straight from the
page when you're using the extension.

## 1. Create a free Supabase project

1. Go to supabase.com → New project (free tier: no card required).
2. Once it's created, open **SQL Editor → New query**, paste in the contents
   of `supabase/schema.sql`, and run it. This creates the tables, the
   leaderboard view, and the row-level security policies.
3. Go to **Project Settings → API**. You'll need the **Project URL** and the
   **anon / public key** in the next step.
4. Go to **Authentication → Email Templates → Magic Link**, and add
   `{{ .Token }}` somewhere in the template body (e.g. "Or enter this code:
   {{ .Token }}"). This is only needed for the browser extension, which signs
   in with a 6-digit code instead of a clickable link — there's nowhere for a
   link to redirect *to* inside an extension popup. Skip this step if you
   only care about the website.

## 2. Run the website locally

```bash
cp .env.local.example .env.local
# then fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

Open http://localhost:3000, sign in with your email (you'll get a magic
link), paste a YouTube link on the Rate tab, and rate it.

## 3. Deploy the website for free

1. Push this folder to a new GitHub repo.
2. Go to vercel.com → New Project → import that repo.
3. Add the same two environment variables from `.env.local` in Vercel's
   project settings.
4. Deploy. You'll get a free `your-project.vercel.app` URL.
5. Back in Supabase, go to **Authentication → URL Configuration** and add
   your Vercel URL to the redirect URLs list (so magic links work in
   production, not just localhost).

## 4. Load the browser extension

1. Open `extension/config.js` and fill in the same `SUPABASE_URL` and
   `SUPABASE_ANON_KEY` you used in `.env.local`.
2. Open `extension/manifest.json` and replace `YOUR-PROJECT.supabase.co` in
   `host_permissions` with your actual Supabase project URL.
3. In Chrome, go to `chrome://extensions`, turn on **Developer mode**, click
   **Load unpacked**, and select the `extension` folder.
4. Open any `youtube.com/watch` page. Click the Scrubbed icon in your
   toolbar, enter your email, and enter the 6-digit code it emails you.
5. Refresh the YouTube tab — a small rating widget appears in the bottom
   right of the page.

This is entirely free to use as-is (side-loaded/"unpacked"). Publishing it on
the Chrome Web Store, if you ever want to, costs a one-time $5 developer fee
— not required for a proof of concept.

## How it fits together

- **Website** (`src/`) — Next.js App Router + Tailwind. Paste-a-link rating,
  personal log, and the public leaderboard.
- **Database** (`supabase/schema.sql`) — three tables (`profiles`, `videos`,
  `ratings`) plus a `video_leaderboard` view that averages ratings per video.
  Row-level security means everyone can *read* ratings and the leaderboard,
  but people can only write their own ratings.
- **Extension** (`extension/`) — a Manifest V3 content script that reads the
  video ID and title straight off the YouTube page, and talks to Supabase's
  REST API directly (no server in between) using the same anon key as the
  website.

## Where this stays free, and where it stops

- Supabase free tier: 500MB database, 50,000 monthly active users, 5GB
  bandwidth — comfortably enough for a proof of concept and early users.
- Vercel free tier (Hobby plan): generous for personal/POC projects, not
  licensed for commercial resale.
- The only real-money item anywhere in this stack is the optional $5
  one-time fee to list the extension on the Chrome Web Store.

If this grows past proof-of-concept, the first thing you'd likely outgrow is
Supabase's free database size — paid tiers start around $25/month.
