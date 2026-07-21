'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download, Loader2 } from 'lucide-react'

export function ExportDataButton() {
  const [exporting, setExporting] = useState(false)
  const supabase = createClient()

  async function handleExport() {
    setExporting(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch all ratings for the user
      const { data: ratings, error } = await supabase
        .from('ratings')
        .select('rating, review, watch_status, created_at, updated_at, videos(id, title, url)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error || !ratings) throw new Error('Failed to fetch ratings')

      // Build CSV
      const headers = ['Video ID', 'Title', 'URL', 'Rating', 'Review', 'Watch Status', 'Created At', 'Updated At']
      const rows = ratings.map(r => {
        const v = r.videos as any
        return [
          v?.id || '',
          `"${(v?.title || '').replace(/"/g, '""')}"`, // escape quotes in title
          v?.url || '',
          r.rating || '',
          `"${(r.review || '').replace(/"/g, '""')}"`, // escape quotes in review
          r.watch_status || '',
          r.created_at || '',
          r.updated_at || ''
        ].join(',')
      })

      const csvContent = [headers.join(','), ...rows].join('\n')
      
      // Create blob and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `scrubbed_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (e) {
      console.error(e)
      alert('An error occurred while exporting your data.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-surface-alt border border-border text-ink hover:bg-surface hover:border-amber/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      Export Ratings (CSV)
    </button>
  )
}
