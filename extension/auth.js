// Shared auth helpers for the Scrubbed extension.
// Uses Supabase email + password sign in flow matching the web app.

async function getSession() {
  try {
    if (typeof chrome === 'undefined' || !chrome.runtime?.id || !chrome.storage?.local) return null
    const { scrubbed_session } = await chrome.storage.local.get('scrubbed_session')
    return scrubbed_session || null
  } catch (e) {
    return null
  }
}

async function saveSession(session) {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.id && chrome.storage?.local) {
      await chrome.storage.local.set({ scrubbed_session: session })
    }
  } catch (e) {
    // Ignored if context invalidated
  }
}

async function clearSession() {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.id && chrome.storage?.local) {
      await chrome.storage.local.remove('scrubbed_session')
    }
  } catch (e) {
    // Ignored if context invalidated
  }
}

async function signInWithPassword(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error_description || err.msg || 'Invalid email or password.')
  }
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
