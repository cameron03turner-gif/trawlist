# 1. Create the .env.local file with your credentials
Copy-Item .env.local.example .env.local
(Get-Content .env.local) `
  -replace 'NEXT_PUBLIC_SUPABASE_URL=.*', 'NEXT_PUBLIC_SUPABASE_URL=https://gfsxhsztvufwywrfdatj.supabase.co' `
  -replace 'NEXT_PUBLIC_SUPABASE_ANON_KEY=.*', 'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmc3hoc3p0dnVmd3l3cmZkYXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzUzNzMsImV4cCI6MjA5OTk1MTM3M30.OU12KPgXuh-yKZzRNQL-_RtvpvAQs0hFz7PTcIzGKu8' |
  Set-Content .env.local

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev