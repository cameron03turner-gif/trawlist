// Shared auth helpers for the Scrubbed extension.
// Uses Supabase's email OTP (one-time code) flow, since magic-link
// redirects don't have anywhere to land inside an extension.
// Requires the Magic Link email template to include {{ .Token }} —
// see the README for the one-time Supabase dashboard setting.

async function getSession() {
  const { scrubbed_session } = await chrome.storage.local.get('scrubbed_session')
  return scrubbed_session || null
}

async function saveSession(session) {
  await chrome.storage.local.set({ scrubbed_session: session })
}

async function clearSession() {
  await chrome.storage.local.remove('scrubbed_session')
}

async function requestCode(email) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, create_user: true }),
  })
  if (!res.ok) throw new Error('Could not send a code. Check the email and try again.')
}

async function verifyCode(email, token) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, token, type: 'email' }),
  })
  if (!res.ok) throw new Error('That code is invalid or expired.')
  const data = await res.json()
  const session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    user: { id: data.user.id, email: data.user.email },
  }
  await saveSession(session)
  return session
}

async function refreshSession(session) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  })
  if (!res.ok) return null
  const data = await res.json()
  const next = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    user: session.user,
  }
  await saveSession(next)
  return next
}

async function getValidSession() {
  let session = await getSession()
  if (!session) return null
  if (Date.now() > session.expires_at - 60000) {
    session = await refreshSession(session)
  }
  return session
}
