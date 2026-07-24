export function extractVideoId(raw: string): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  const idPattern = /^[a-zA-Z0-9_-]{11}$/
  if (idPattern.test(trimmed)) return trimmed

  try {
    const url = new URL(/^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`)

    if (url.hostname.includes('youtu.be')) {
      const seg = url.pathname.split('/').filter(Boolean)[0]
      if (seg && idPattern.test(seg)) return seg
    }

    if (url.hostname.includes('youtube.com')) {
      const v = url.searchParams.get('v')
      if (v && idPattern.test(v)) return v

      const parts = url.pathname.split('/').filter(Boolean)
      const idx = parts.findIndex((p) => p === 'shorts' || p === 'embed' || p === 'live')
      if (idx !== -1 && parts[idx + 1] && idPattern.test(parts[idx + 1])) {
        return parts[idx + 1]
      }
    }
  } catch {
    return null
  }

  return null
}

export function cleanVideoTitle(title: string | null | undefined): string {
  if (!title) return ''
  return title.replace(/^\(\d+\+?\)\s*/, '').trim()
}

export type OEmbedResult = { title: string; author_name: string; author_url: string }

export async function fetchOEmbed(videoId: string): Promise<OEmbedResult | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(
        `https://www.youtube.com/watch?v=${videoId}`
      )}&format=json`
    )
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function fetchChannelThumbnail(authorUrl: string): Promise<string | null> {
  if (!authorUrl) return null
  try {
    const res = await fetch(authorUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    if (!res.ok) return null
    const html = await res.text()
    const match = html.match(/<meta property="og:image" content="([^"]+)"/)
    return match ? match[1] : null
  } catch {
    return null
  }
}
