;(async function () {
  const videoId = new URLSearchParams(location.search).get('v')
  if (!videoId) return

  function getMeta() {
    const title = document.title.replace(/ - YouTube$/, '')
    const channelEl = document.querySelector('ytd-channel-name a, #channel-name a, #text.ytd-channel-name')
    const channel = channelEl ? channelEl.textContent.trim() : ''
    return { title, channel }
  }

  async function upsertVideo(session, meta) {
    await fetch(`${SUPABASE_URL}/rest/v1/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: videoId,
        title: meta.title,
        channel: meta.channel,
        thumbnail_url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      }),
    })
  }

  async function upsertRating(session, rating) {
    await fetch(`${SUPABASE_URL}/rest/v1/ratings?on_conflict=user_id,video_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        user_id: session.user.id,
        video_id: videoId,
        rating,
        updated_at: new Date().toISOString(),
      }),
    })
  }

  function buildWidget(signedIn) {
    const el = document.createElement('div')
    el.id = 'scrubbed-widget'
    if (!signedIn) {
      el.innerHTML = `
        <div class="scrubbed-card">
          <span class="scrubbed-title">SCRUBBED</span>
          <span class="scrubbed-msg">Click the extension icon to sign in and rate this video.</span>
        </div>`
      return el
    }
    el.innerHTML = `
      <div class="scrubbed-card">
        <span class="scrubbed-title">Rate this video</span>
        <div class="scrubbed-scrubber" id="scrubbed-scrubber">
          <div class="scrubbed-fill" id="scrubbed-fill"></div>
          <div class="scrubbed-handle" id="scrubbed-handle"></div>
        </div>
        <div class="scrubbed-row">
          <span class="scrubbed-value" id="scrubbed-value">2.5</span>
          <button class="scrubbed-save" id="scrubbed-save">Save</button>
        </div>
      </div>`
    return el
  }

  async function init() {
    document.getElementById('scrubbed-widget')?.remove()
    const session = await getValidSession()
    const widget = buildWidget(!!session)
    document.body.appendChild(widget)
    if (!session) return

    const track = widget.querySelector('#scrubbed-scrubber')
    const fill = widget.querySelector('#scrubbed-fill')
    const handle = widget.querySelector('#scrubbed-handle')
    const valueEl = widget.querySelector('#scrubbed-value')
    const saveBtn = widget.querySelector('#scrubbed-save')
    let rating = 2.5

    function paint() {
      const pct = (rating / 5) * 100
      fill.style.width = pct + '%'
      handle.style.left = `calc(${pct}% - 7px)`
      valueEl.textContent = rating.toFixed(1)
    }
    paint()

    track.addEventListener('click', (e) => {
      const rect = track.getBoundingClientRect()
      const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width)
      rating = Math.round(((x / rect.width) * 5) * 2) / 2
      paint()
    })

    saveBtn.addEventListener('click', async () => {
      saveBtn.textContent = 'Saving…'
      const meta = getMeta()
      await upsertVideo(session, meta)
      await upsertRating(session, rating)
      saveBtn.textContent = 'Saved ✓'
      setTimeout(() => (saveBtn.textContent = 'Save'), 2000)
    })

    // Attach ended listener to prompt rating
    const checkVideo = setInterval(() => {
      const video = document.querySelector('video')
      if (video) {
        clearInterval(checkVideo)
        video.addEventListener('ended', () => {
          widget.style.boxShadow = '0 0 0 2px #f59e0b, 0 8px 30px rgba(245, 158, 11, 0.4)'
          widget.style.transform = 'translateY(-4px) scale(1.02)'
          const title = widget.querySelector('.scrubbed-title')
          if (title) title.textContent = 'Video ended! Rate it?'
        })
      }
    }, 1000)
  }

  init()
  // YouTube is a single-page app: re-run when navigating between videos.
  let lastUrl = location.href
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href
      if (new URLSearchParams(location.search).get('v')) init()
    }
  }).observe(document.body, { childList: true, subtree: true })
})()
