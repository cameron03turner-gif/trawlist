# Trawlist Developer Operations & Maintenance Guide

This document is your reference guide as the lead developer of **Trawlist**. It covers database administration, bug triage, debugging runtime errors, user support scenarios, Chrome Extension sync, and deployment routines.

---

## 🛠️ 1. Architecture Overview

- **Framework**: Next.js (App Router, Server Components & Server Actions)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Realtime Engine)
- **Styling**: Custom theme defined in `tailwind.config.ts` (`bg`, `surface`, `surface-alt`, `amber`, `rec`, `ink`, `muted`)
- **Extension**: Manifest V3 Chrome Extension located in `/extension`

---

## 🗄️ 2. Database Management & Migrations

SQL migrations are located in the `supabase/` directory (`m1_...sql` through `m13_bug_reports.sql`).

### Running Migrations
1. Open your **Supabase Dashboard** → **SQL Editor** → **New Query**.
2. Paste the contents of the migration file (e.g., [m13_bug_reports.sql](file:///c:/scrubbed/supabase/m13_bug_reports.sql)).
3. Ensure no text is highlighted and click **Run**.

### Schema Best Practices
- **Row Level Security (RLS)** is enabled on all tables. Always define explicit SELECT/INSERT/UPDATE/DELETE policies when creating new tables.
- **Foreign Keys**: Cascading deletes (`ON DELETE CASCADE`) are configured on `user_id` / `profile_id` references to support instant user account deletion.

---

## 🐛 3. Bug Reports & Community Tracker Triage

Submitted user bug reports land directly in the `public.bug_reports` table and display on the `/bug-report` community board.

### Triage Workflow
1. Go to **Supabase Dashboard** → **Table Editor** → **`bug_reports`**.
2. Review new rows with `status = 'open'`.
3. To update progress, double-click the `status` column or run SQL:
   ```sql
   UPDATE bug_reports 
   SET status = 'in_progress' -- Options: 'under_review', 'in_progress', 'resolved', 'closed'
   WHERE id = 'TICKET_ID_HERE';
   ```
4. The `/bug-report` community tracker board updates live on the website once the status is updated.

---

## 👤 4. User Support & Common Scenarios

### Scenario A: User Wants to Delete Their Account
- **Automated**: Users can delete their account directly under `/settings` → **Delete Account**.
- **Manual (Admin)**: Go to **Supabase Dashboard** → **Authentication** → **Users** → **Delete User**. Because of `ON DELETE CASCADE` foreign keys, all ratings, custom lists, favourites, and profile rows will be wiped automatically.

### Scenario B: Username Conflicts or Edits
- Usernames are unique. If a user gets stuck during onboarding due to username duplication, inspect `public.profiles` in Supabase to check existing usernames.

### Scenario C: Moderation / Spam Prevention
- If a user posts offensive reviews or spam lists:
  - **Option 1**: Delete the specific row in `public.ratings` or `public.lists` via Supabase Table Editor.
  - **Option 2**: Disable the user's account in **Supabase Auth -> Users -> Disable User**.

---

## 🔍 5. Debugging & Error Diagnosis

When investigating runtime errors, check the logs in this order:

1. **Supabase API & Auth Logs**:
   - **Where**: Supabase Dashboard → **Logs** → **API Logs** / **Auth Logs**.
   - **What to look for**: RLS policy rejections (`ERROR 42501: permission denied for table ...`) or missing environment variables.
2. **Next.js Server Logs (Vercel / Node)**:
   - **Where**: Vercel Dashboard → **Logs** (or local terminal standard output).
   - **What to look for**: Failures inside Server Actions (`src/app/actions/`).
3. **Browser Console & Network Tab**:
   - **Where**: Browser Developer Tools (`F12`).
   - **What to look for**: Client-side hydration warnings, extension cross-origin fetch issues, or network 401/403/500 codes.

---

## 🧩 6. Chrome Extension Sync

The Chrome Extension communicates with Trawlist via dedicated API endpoints:
- `/api/extension/rating` (Fetches & saves ratings directly from YouTube pages)
- `/api/extension/sync` (Syncs watch history & likes)
- `/api/extension/history` (Imports watch history)

### Extension Debugging
- If extension ratings fail to load on YouTube:
  1. Open Chrome → `chrome://extensions` → Click **Errors** on the Trawlist Extension card.
  2. Inspect background service worker logs.
  3. Ensure user is logged in at `https://www.trawlist.com`.

---

## 🔑 7. Environment Variables (`.env.local`)

Keep these variables updated in your local `.env.local` and deployment hosting environment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # KEEP SECRET! Server-side only
```

> ⚠️ **Security Alert**: Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code or commit it to GitHub.

---

## 🚀 8. Pre-Deployment Verification Checklist

Before pushing changes or deploying to production, run these 2 commands in your terminal:

```bash
# 1. Verify TypeScript types
npx tsc --noEmit

# 2. Test production build compilation
npm run build
```

If both commands complete with **0 errors**, your site is ready for deployment!
