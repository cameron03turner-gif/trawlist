;(function () {
  let activeVideoId = null

  function getVideoId() {
    return new URLSearchParams(location.search).get('v')
  }

  function getMeta() {
    const title = document.title.replace(/ - YouTube$/, '')
    const channelEl = document.querySelector('ytd-channel-name a, #channel-name a, #text.ytd-channel-name')
    const channel = channelEl ? channelEl.textContent.trim() : ''
    return { title, channel }
  }

  async function fetchRatingDetails(session, videoId) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/ratings?user_id=eq.${session.user.id}&video_id=eq.${videoId}&select=rating,liked,review`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        if (data && data[0]) return data[0]
      }
    } catch (e) {
      console.error('Error fetching rating details:', e)
    }
    return { rating: null, liked: false, review: '' }
  }

  async function upsertVideo(session, videoId, meta) {
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

  async function upsertRatingDetails(session, videoId, { rating, liked, review }) {
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
        rating: rating || null,
        liked: !!liked,
        review: review || null,
        updated_at: new Date().toISOString(),
      }),
    })
  }

  const STAR_SVG = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>`

  const HEART_SVG = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>`

  const REVIEW_SVG = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>`

  function renderStarsHtml() {
    let starsHtml = ''
    for (let i = 1; i <= 5; i++) {
      starsHtml += `
        <div class="scrubbed-star-wrap" data-star="${i}">
          <div class="scrubbed-star-bg">${STAR_SVG}</div>
          <div class="scrubbed-star-clip" id="scrubbed-star-clip-${i}" style="width: 0%;">
            <div class="scrubbed-star-fg">${STAR_SVG}</div>
          </div>
        </div>`
    }
    return starsHtml
  }

  function buildWidget(signedIn) {
    const logoUrl = typeof chrome !== 'undefined' && chrome.runtime?.id && chrome.runtime?.getURL ? chrome.runtime.getURL('logo.png') : ''
    const el = document.createElement('div')
    el.id = 'scrubbed-widget'

    if (!signedIn) {
      el.innerHTML = `
        <div class="scrubbed-pill collapsed" id="scrubbed-pill">
          <div class="scrubbed-logo-btn" id="scrubbed-logo-btn" title="Sign in to rate">
            ${logoUrl ? `<img src="${logoUrl}" class="scrubbed-logo-img" alt="Trawlist" />` : ''}
          </div>
          <div class="scrubbed-pill-content-wrapper">
            <div class="scrubbed-pill-content-inner">
              <span style="font-size: 12px; color: #8CB5C0; font-weight: 500;">Sign in to rate</span>
            </div>
          </div>
        </div>`
      return el
    }

    el.innerHTML = `
      <div class="scrubbed-pill collapsed" id="scrubbed-pill">
        <div class="scrubbed-logo-btn" id="scrubbed-logo-btn" title="Rate this video">
          ${logoUrl ? `<img src="${logoUrl}" class="scrubbed-logo-img" alt="Trawlist" />` : ''}
        </div>
        <div class="scrubbed-pill-content-wrapper">
          <div class="scrubbed-pill-content-inner">
            <div class="scrubbed-stars" id="scrubbed-stars">
              ${renderStarsHtml()}
            </div>
            <span class="scrubbed-value" id="scrubbed-value">0.0</span>
            <div class="scrubbed-actions-wrapper hidden" id="scrubbed-actions-wrapper">
              <div class="scrubbed-divider"></div>
              <button class="scrubbed-icon-btn scrubbed-like-btn" id="scrubbed-like-btn" title="Like Video">
                ${HEART_SVG}
              </button>
              <button class="scrubbed-icon-btn scrubbed-review-btn" id="scrubbed-review-btn" title="Write Review">
                ${REVIEW_SVG}
              </button>
            </div>
            <span class="scrubbed-status-indicator" id="scrubbed-status"></span>
          </div>
        </div>
      </div>
      <div class="scrubbed-review-popover hidden" id="scrubbed-review-popover">
        <textarea id="scrubbed-review-text" placeholder="Share your thoughts on this video..."></textarea>
        <div class="scrubbed-popover-footer">
          <button id="scrubbed-save-review-btn" class="scrubbed-btn-primary">Post Review</button>
        </div>
      </div>`
    return el
  }

  function placeWidgetInDOM(widget) {
    const actionContainer = document.querySelector(
      '#actions #actions-inner, ytd-watch-metadata #actions #top-level-buttons-computed, #top-row #actions, ytd-menu-renderer #top-level-buttons-computed'
    )

    if (actionContainer) {
      widget.classList.add('scrubbed-inline')
      actionContainer.appendChild(widget)
    } else {
      const fallbackTarget = document.querySelector('#above-the-fold, ytd-watch-metadata, #primary-inner')
      if (fallbackTarget) {
        widget.classList.add('scrubbed-inline')
        fallbackTarget.appendChild(widget)
      } else {
        widget.classList.remove('scrubbed-inline')
        document.body.appendChild(widget)
      }
    }
  }

  async function init() {
    const videoId = getVideoId()
    if (!videoId) {
      document.getElementById('scrubbed-widget')?.remove()
      activeVideoId = null
      return
    }

    activeVideoId = videoId
    document.getElementById('scrubbed-widget')?.remove()

    const session = await getValidSession()
    const widget = buildWidget(!!session)
    placeWidgetInDOM(widget)

    const pill = widget.querySelector('#scrubbed-pill')
    const logoBtn = widget.querySelector('#scrubbed-logo-btn')
    const popover = widget.querySelector('#scrubbed-review-popover')

    // Click logo icon to toggle expand / collapse smoothly
    if (logoBtn && pill) {
      logoBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        const isCurrentlyExpanded = !pill.classList.contains('collapsed')
        if (isCurrentlyExpanded && popover) {
          popover.classList.add('hidden')
        }
        pill.classList.toggle('collapsed')
      })
    }

    if (!session) return

    const starsContainer = widget.querySelector('#scrubbed-stars')
    const valueEl = widget.querySelector('#scrubbed-value')
    const actionsWrapper = widget.querySelector('#scrubbed-actions-wrapper')
    const likeBtn = widget.querySelector('#scrubbed-like-btn')
    const reviewBtn = widget.querySelector('#scrubbed-review-btn')
    const statusEl = widget.querySelector('#scrubbed-status')
    
    // Popover Elements
    const reviewTextarea = widget.querySelector('#scrubbed-review-text')
    const saveReviewBtn = widget.querySelector('#scrubbed-save-review-btn')

    let currentRating = 0
    let currentLiked = false
    let currentReview = ''
    let hoverRating = null

    function paint(val) {
      const displayVal = val !== null ? val : currentRating
      valueEl.textContent = displayVal > 0 ? displayVal.toFixed(1) : '0.0'

      for (let i = 1; i <= 5; i++) {
        const clip = widget.querySelector(`#scrubbed-star-clip-${i}`)
        if (!clip) continue
        const fillAmount = Math.max(0, Math.min(1, displayVal - (i - 1)))
        clip.style.width = `${fillAmount * 100}%`
      }

      // Show like & review buttons only if rating is set (> 0)
      if (currentRating > 0) {
        actionsWrapper.classList.remove('hidden')
      } else {
        actionsWrapper.classList.add('hidden')
      }

      if (currentLiked) {
        likeBtn.classList.add('active')
        likeBtn.title = 'Unlike Video'
      } else {
        likeBtn.classList.remove('active')
        likeBtn.title = 'Like Video'
      }

      if (currentReview) {
        reviewBtn.classList.add('active')
        reviewBtn.title = 'Edit Review'
      } else {
        reviewBtn.classList.remove('active')
        reviewBtn.title = 'Write Review'
      }
    }

    async function saveState() {
      if (statusEl) statusEl.textContent = 'Saving…'
      try {
        const meta = getMeta()
        await upsertVideo(session, videoId, meta)
        await upsertRatingDetails(session, videoId, {
          rating: currentRating,
          liked: currentLiked,
          review: currentReview,
        })
        if (statusEl) {
          statusEl.textContent = '✓'
          setTimeout(() => {
            if (statusEl) statusEl.textContent = ''
          }, 2000)
        }
      } catch (err) {
        console.error(err)
        if (statusEl) statusEl.textContent = 'Error'
      }
    }

    // Fetch user's existing rating details
    const existing = await fetchRatingDetails(session, videoId)
    if (existing) {
      if (existing.rating !== null && existing.rating !== undefined) currentRating = Number(existing.rating)
      if (existing.liked !== undefined) currentLiked = !!existing.liked
      if (existing.review) currentReview = existing.review
      reviewTextarea.value = currentReview
    }
    paint(null)

    // Interactive Star Hover & Click Logic
    starsContainer.addEventListener('mousemove', (e) => {
      const rect = starsContainer.getBoundingClientRect()
      const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width)
      const pct = x / rect.width
      const rawVal = Math.round((pct * 5) * 2) / 2
      hoverRating = Math.max(0.5, Math.min(5, rawVal))
      paint(hoverRating)
    })

    starsContainer.addEventListener('mouseleave', () => {
      hoverRating = null
      paint(null)
    })

    starsContainer.addEventListener('click', async () => {
      if (hoverRating !== null) {
        currentRating = hoverRating
      } else if (currentRating === 0) {
        currentRating = 5.0
      }
      paint(null)
      await saveState()
    })

    // Like Button Click
    likeBtn.addEventListener('click', async () => {
      currentLiked = !currentLiked
      paint(null)
      await saveState()
    })

    // Review Button Click (Opens Popover)
    reviewBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      popover.classList.toggle('hidden')
      if (!popover.classList.contains('hidden')) {
        reviewTextarea.focus()
      }
    })

    saveReviewBtn.addEventListener('click', async () => {
      currentReview = reviewTextarea.value.trim()
      popover.classList.add('hidden')
      paint(null)
      await saveState()
    })

    // Close popover when clicking anywhere outside
    document.addEventListener('click', (e) => {
      if (popover && !popover.contains(e.target) && !reviewBtn.contains(e.target)) {
        popover.classList.add('hidden')
      }
    })
  }

  // Poll for DOM readiness & YouTube SPA navigation
  let attempts = 0
  const tryInit = setInterval(() => {
    const v = getVideoId()
    if (v) {
      attempts++
      const target = document.querySelector('#actions #actions-inner, ytd-watch-metadata #actions, #above-the-fold')
      if (target || attempts > 10) {
        clearInterval(tryInit)
        init()
      }
    }
  }, 400)

  let lastUrl = location.href
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href
      setTimeout(init, 500)
    }
  }).observe(document.body, { childList: true, subtree: true })
})()
