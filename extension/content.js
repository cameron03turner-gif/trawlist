;(function () {
  let activeVideoId = null

  function getVideoId() {
    return new URLSearchParams(location.search).get('v')
  }

  function getMeta() {
    const titleEl = document.querySelector('h1.ytd-watch-metadata, #title h1, h1.title, ytd-watch-flexy h1')
    let title = titleEl ? titleEl.textContent.trim() : document.title
    title = title.replace(/ - YouTube$/, '').replace(/^\(\d+\+?\)\s*/, '').trim()

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

  async function fetchVideoStats(videoId) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/ratings?video_id=eq.${videoId}&select=rating,liked,review`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      })
      if (res.ok) {
        const rows = await res.json()
        if (rows && rows.length > 0) {
          const ratedRows = rows.filter(r => r.rating !== null && r.rating !== undefined)
          const avgRating = ratedRows.length > 0 ? (ratedRows.reduce((acc, r) => acc + Number(r.rating), 0) / ratedRows.length) : 0
          const ratingsCount = ratedRows.length
          const reviewsCount = rows.filter(r => r.review && r.review.trim().length > 0).length
          const likesCount = rows.filter(r => r.liked).length
          return { avgRating, ratingsCount, reviewsCount, likesCount }
        }
      }
    } catch (e) {
      console.error('Error fetching video stats:', e)
    }
    return { avgRating: 0, ratingsCount: 0, reviewsCount: 0, likesCount: 0 }
  }

  async function fetchUserLists(session) {
    try {
      let res = await fetch(`${SUPABASE_URL}/rest/v1/lists?owner_id=eq.${session.user.id}&select=id,title,is_private&order=created_at.desc`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      if (res.ok) return await res.json()

      res = await fetch(`${SUPABASE_URL}/rest/v1/custom_lists?owner_id=eq.${session.user.id}&select=id,title,is_private&order=created_at.desc`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      if (res.ok) return await res.json()
    } catch (e) {
      console.error('Error fetching lists:', e)
    }
    return []
  }

  async function fetchVideoListMemberships(session, videoId) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/list_items?video_id=eq.${videoId}&select=list_id`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        return new Set(data.map(item => item.list_id))
      }
    } catch (e) {
      console.error('Error fetching list memberships:', e)
    }
    return new Set()
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

  async function toggleVideoInList(session, listId, videoId, isCurrentlyInList, meta) {
    if (!isCurrentlyInList) {
      await upsertVideo(session, videoId, meta)
      let position = 1
      try {
        const posRes = await fetch(`${SUPABASE_URL}/rest/v1/list_items?list_id=eq.${listId}&select=position&order=position.desc&limit=1`, {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}` }
        })
        if (posRes.ok) {
          const posData = await posRes.json()
          if (posData[0]?.position) position = posData[0].position + 1
        }
      } catch (e) {}

      const res = await fetch(`${SUPABASE_URL}/rest/v1/list_items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          list_id: listId,
          video_id: videoId,
          position: position,
        })
      })
      return res.ok
    } else {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/list_items?list_id=eq.${listId}&video_id=eq.${videoId}`, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
        }
      })
      return res.ok
    }
  }

  async function createNewList(session, title) {
    try {
      let res = await fetch(`${SUPABASE_URL}/rest/v1/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          owner_id: session.user.id,
          title: title,
          description: null,
          is_private: false,
          is_ranked: false,
        })
      })
      if (res.ok) {
        const data = await res.json()
        return data && data[0] ? data[0] : null
      }

      res = await fetch(`${SUPABASE_URL}/rest/v1/custom_lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          owner_id: session.user.id,
          title: title,
          description: '',
          is_private: false,
        })
      })
      if (res.ok) {
        const data = await res.json()
        return data && data[0] ? data[0] : null
      }
    } catch (e) {
      console.error('Error creating new list:', e)
    }
    return null
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

  const LIST_PLUS_SVG = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
    <path d="M11 12H3M16 6H3M16 18H3M18 9v6M15 12h6"/>
  </svg>`

  const CHECK_SVG = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" fill="none">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`

  const DETAILS_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`

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
    const el = document.createElement('div')
    el.id = 'scrubbed-widget'

    const logoUrl = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL ? chrome.runtime.getURL('logo.png') : null

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
              <button class="scrubbed-icon-btn scrubbed-list-btn" id="scrubbed-list-btn" title="Add to List">
                ${LIST_PLUS_SVG}
              </button>
              <button class="scrubbed-icon-btn scrubbed-details-btn" id="scrubbed-details-btn" title="More Details">
                ${DETAILS_SVG}
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
      </div>
      <div class="scrubbed-list-popover hidden" id="scrubbed-list-popover">
        <div class="scrubbed-popover-header">
          <span>Add to List</span>
          <button class="scrubbed-popover-close-btn" id="scrubbed-list-close-btn">&times;</button>
        </div>
        <div class="scrubbed-lists-container" id="scrubbed-lists-container">
          <div class="scrubbed-loading-text">Loading lists…</div>
        </div>
        <div class="scrubbed-create-list-wrapper">
          <input type="text" id="scrubbed-new-list-title" placeholder="New list name..." />
          <button id="scrubbed-create-list-btn" class="scrubbed-btn-primary">+ Add</button>
        </div>
      </div>
      <div class="scrubbed-details-popover hidden" id="scrubbed-details-popover">
        <div class="scrubbed-popover-header">
          <span>More Details</span>
          <button class="scrubbed-popover-close-btn" id="scrubbed-details-close-btn">&times;</button>
        </div>
        <div class="scrubbed-details-container" id="scrubbed-details-container">
          <div class="scrubbed-loading-text">Loading details…</div>
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
    const reviewPopover = widget.querySelector('#scrubbed-review-popover')
    const listPopover = widget.querySelector('#scrubbed-list-popover')
    const detailsPopover = widget.querySelector('#scrubbed-details-popover')

    // Click logo icon to toggle expand / collapse smoothly
    if (logoBtn && pill) {
      logoBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        const isCurrentlyExpanded = !pill.classList.contains('collapsed')
        if (isCurrentlyExpanded) {
          if (reviewPopover) reviewPopover.classList.add('hidden')
          if (listPopover) listPopover.classList.add('hidden')
          if (detailsPopover) detailsPopover.classList.add('hidden')
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
    const listBtn = widget.querySelector('#scrubbed-list-btn')
    const statusEl = widget.querySelector('#scrubbed-status')
    
    // Review Popover Elements
    const reviewTextarea = widget.querySelector('#scrubbed-review-text')
    const saveReviewBtn = widget.querySelector('#scrubbed-save-review-btn')

    // List Popover Elements
    const listCloseBtn = widget.querySelector('#scrubbed-list-close-btn')
    const listsContainer = widget.querySelector('#scrubbed-lists-container')
    const newListInput = widget.querySelector('#scrubbed-new-list-title')
    const createListBtn = widget.querySelector('#scrubbed-create-list-btn')

    // Details Popover Elements
    const detailsBtn = widget.querySelector('#scrubbed-details-btn')
    const detailsCloseBtn = widget.querySelector('#scrubbed-details-close-btn')
    const detailsContainer = widget.querySelector('#scrubbed-details-container')

    let currentRating = 0
    let currentLiked = false
    let currentReview = ''
    let hoverRating = null
    let listMemberships = new Set()

    async function renderDetailsPopover() {
      detailsContainer.innerHTML = `<div class="scrubbed-loading-text">Loading details…</div>`
      const stats = await fetchVideoStats(videoId)
      const avgStr = stats.avgRating > 0 ? stats.avgRating.toFixed(1) : 'N/A'
      
      detailsContainer.innerHTML = `
        <div class="scrubbed-details-rating-block">
          <div class="scrubbed-details-rating-score">${avgStr} ${stats.avgRating > 0 ? '★' : ''}</div>
          <div class="scrubbed-details-rating-label">Average Rating</div>
        </div>
        <div class="scrubbed-details-stats-grid">
          <div class="scrubbed-stat-card">
            <div class="scrubbed-stat-value">${stats.ratingsCount}</div>
            <div class="scrubbed-stat-label">Ratings</div>
          </div>
          <div class="scrubbed-stat-card">
            <div class="scrubbed-stat-value">${stats.reviewsCount}</div>
            <div class="scrubbed-stat-label">Reviews</div>
          </div>
          <div class="scrubbed-stat-card">
            <div class="scrubbed-stat-value">${stats.likesCount}</div>
            <div class="scrubbed-stat-label">Likes</div>
          </div>
        </div>
        <a href="https://www.trawlist.com/videos/${videoId}" target="_blank" rel="noopener noreferrer" class="scrubbed-btn-primary scrubbed-to-video-btn">
          To Video Page &rarr;
        </a>
      `
    }

    function paint(val) {
      const displayVal = val !== null ? val : currentRating
      valueEl.textContent = displayVal > 0 ? displayVal.toFixed(1) : '0.0'

      for (let i = 1; i <= 5; i++) {
        const clip = widget.querySelector(`#scrubbed-star-clip-${i}`)
        if (!clip) continue
        const fillAmount = Math.max(0, Math.min(1, displayVal - (i - 1)))
        clip.style.width = `${fillAmount * 100}%`
      }

      // Show action buttons only if rating is set (> 0)
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

      if (listMemberships.size > 0) {
        listBtn.classList.add('active')
        listBtn.title = 'In Lists (Click to Edit)'
      } else {
        listBtn.classList.remove('active')
        listBtn.title = 'Add to List'
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

    async function updateListMemberships() {
      listMemberships = await fetchVideoListMemberships(session, videoId)
      paint(null)
    }

    async function renderListsDropdown() {
      listsContainer.innerHTML = `<div class="scrubbed-loading-text">Loading lists…</div>`
      const [userLists, memberships] = await Promise.all([
        fetchUserLists(session),
        fetchVideoListMemberships(session, videoId)
      ])
      listMemberships = memberships
      paint(null)

      if (!userLists || userLists.length === 0) {
        listsContainer.innerHTML = `<div class="scrubbed-empty-text">No custom lists created yet.</div>`
        return
      }

      listsContainer.innerHTML = ''
      userLists.forEach(list => {
        const itemEl = document.createElement('div')
        const isInList = listMemberships.has(list.id)
        itemEl.className = `scrubbed-list-item ${isInList ? 'selected' : ''}`
        itemEl.dataset.listId = list.id
        itemEl.innerHTML = `
          <div class="scrubbed-checkbox">
            ${CHECK_SVG}
          </div>
          <span class="scrubbed-list-name">${list.title}</span>
        `

        itemEl.addEventListener('click', async (e) => {
          e.stopPropagation()
          const currentlySelected = itemEl.classList.contains('selected')
          itemEl.classList.toggle('selected')
          
          if (currentlySelected) {
            listMemberships.delete(list.id)
          } else {
            listMemberships.add(list.id)
          }

          paint(null)

          const meta = getMeta()
          await toggleVideoInList(session, list.id, videoId, currentlySelected, meta)
        })

        listsContainer.appendChild(itemEl)
      })
    }

    async function handleCreateList() {
      const title = newListInput.value.trim()
      if (!title) return
      newListInput.value = ''
      if (statusEl) statusEl.textContent = 'Creating…'
      
      const newList = await createNewList(session, title)
      if (newList) {
        const meta = getMeta()
        await toggleVideoInList(session, newList.id, videoId, false, meta)
        listMemberships.add(newList.id)
        paint(null)
        if (statusEl) {
          statusEl.textContent = '✓ Created'
          setTimeout(() => { if (statusEl) statusEl.textContent = '' }, 2000)
        }
        await renderListsDropdown()
      } else {
        if (statusEl) statusEl.textContent = 'Error'
      }
    }

    // Fetch user's existing rating details & list memberships
    const [existing] = await Promise.all([
      fetchRatingDetails(session, videoId),
      updateListMemberships()
    ])

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

    // Review Button Click (Opens Review Popover)
    reviewBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      if (listPopover) listPopover.classList.add('hidden')
      if (detailsPopover) detailsPopover.classList.add('hidden')
      reviewPopover.classList.toggle('hidden')
      if (!reviewPopover.classList.contains('hidden')) {
        reviewTextarea.focus()
      }
    })

    saveReviewBtn.addEventListener('click', async () => {
      currentReview = reviewTextarea.value.trim()
      reviewPopover.classList.add('hidden')
      paint(null)
      await saveState()
    })

    // Add to List Button Click (Opens List Dropdown)
    listBtn.addEventListener('click', async (e) => {
      e.stopPropagation()
      if (reviewPopover) reviewPopover.classList.add('hidden')
      if (detailsPopover) detailsPopover.classList.add('hidden')
      listPopover.classList.toggle('hidden')
      if (!listPopover.classList.contains('hidden')) {
        await renderListsDropdown()
      }
    })

    if (listCloseBtn) {
      listCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        listPopover.classList.add('hidden')
      })
    }

    // More Details Button Click (Opens Details Dropdown)
    if (detailsBtn) {
      detailsBtn.addEventListener('click', async (e) => {
        e.stopPropagation()
        if (reviewPopover) reviewPopover.classList.add('hidden')
        if (listPopover) listPopover.classList.add('hidden')
        detailsPopover.classList.toggle('hidden')
        if (!detailsPopover.classList.contains('hidden')) {
          await renderDetailsPopover()
        }
      })
    }

    if (detailsCloseBtn) {
      detailsCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        detailsPopover.classList.add('hidden')
      })
    }

    createListBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      handleCreateList()
    })

    newListInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleCreateList()
      }
    })

    // Close popovers when clicking anywhere outside
    document.addEventListener('click', (e) => {
      if (reviewPopover && !reviewPopover.contains(e.target) && !reviewBtn.contains(e.target)) {
        reviewPopover.classList.add('hidden')
      }
      if (listPopover && !listPopover.contains(e.target) && !listBtn.contains(e.target)) {
        listPopover.classList.add('hidden')
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
