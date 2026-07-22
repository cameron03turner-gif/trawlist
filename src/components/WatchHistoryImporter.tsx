'use client'

import { useState, useRef } from 'react'
import { UploadCloud, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { importWatchHistoryBatch, type ImportedVideo } from '@/app/actions/import'

export function WatchHistoryImporter() {
  const [status, setStatus] = useState<'idle' | 'parsing' | 'ready' | 'importing' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [videos, setVideos] = useState<ImportedVideo[]>([])
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setStatus('parsing')
    setErrorMsg('')

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        if (!Array.isArray(json)) {
          throw new Error('Invalid JSON format: expected an array.')
        }

        const parsedVideos: ImportedVideo[] = []
        
        for (const item of json) {
          // Verify it's a YouTube video watch event
          if (item.header !== 'YouTube') continue
          if (!item.titleUrl || !item.titleUrl.includes('watch?v=')) continue
          
          const videoId = new URL(item.titleUrl).searchParams.get('v')
          if (!videoId) continue

          const title = item.title.replace(/^Watched /, '')
          const channel = item.subtitles?.[0]?.name || null

          parsedVideos.push({
            id: videoId,
            title,
            channel,
            url: item.titleUrl,
            timestamp: item.time
          })
        }

        if (parsedVideos.length === 0) {
          throw new Error('No valid YouTube watch history entries found in this file.')
        }

        setVideos(parsedVideos)
        setStatus('ready')
      } catch (err: any) {
        setStatus('error')
        setErrorMsg(err.message || 'Failed to parse file.')
      }
    }
    reader.onerror = () => {
      setStatus('error')
      setErrorMsg('Error reading file.')
    }
    reader.readAsText(file)
  }

  const startImport = async () => {
    setStatus('importing')
    setErrorMsg('')
    setProgress(0)

    const CHUNK_SIZE = 500
    let processed = 0

    try {
      for (let i = 0; i < videos.length; i += CHUNK_SIZE) {
        const chunk = videos.slice(i, i + CHUNK_SIZE)
        const result = await importWatchHistoryBatch(chunk)
        
        if (result.error) {
          throw new Error(result.error)
        }

        processed += chunk.length
        setProgress(Math.min(processed, videos.length))
      }
      setStatus('done')
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'An error occurred during import.')
    }
  }

  return (
    <div className="bg-surface border border-amber rounded-xl p-6">
      <h3 className="text-lg font-medium mb-2">Import YouTube Watch History</h3>
      <p className="text-sm text-muted mb-6">
        Bootstrap your profile instantly by importing your Google Takeout watch history. We will log the videos as "watched".
      </p>

      <div className="mb-6 bg-surface-alt border border-amber/20 rounded-lg p-4 text-sm text-ink space-y-2 shadow-sm">
        <p className="font-semibold text-amber">How to get your watch-history.json:</p>
        <ol className="list-decimal pl-5 space-y-1.5 text-muted">
          <li>Go to <a href="https://takeout.google.com/" target="_blank" rel="noopener noreferrer" className="text-amber hover:underline transition-colors">Google Takeout</a></li>
          <li>Click <strong>"Deselect all"</strong>, then scroll down and select ONLY <strong>"YouTube and YouTube Music"</strong></li>
          <li>Click the <strong>"Multiple formats"</strong> button, and ensure the format for "history" is set to <strong>JSON</strong></li>
          <li>Click <strong>"Next step"</strong> and create the export</li>
          <li>Extract the downloaded zip, navigate to <code className="bg-bg px-1.5 py-0.5 rounded text-ink border border-amber text-xs font-mono">Takeout/YouTube and YouTube Music/history/</code> and upload <code className="bg-bg px-1.5 py-0.5 rounded text-ink border border-amber text-xs font-mono">watch-history.json</code> below</li>
        </ol>
      </div>

      {status === 'idle' || status === 'error' ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-amber/30 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-amber transition-colors bg-bg"
        >
          <UploadCloud className="w-8 h-8 text-muted mb-3" />
          <p className="text-sm font-medium text-ink mb-1">Click to upload watch-history.json</p>
          <p className="text-xs text-muted">Supports up to 100MB JSON files.</p>
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </div>
      ) : null}

      {status === 'parsing' && (
        <div className="flex flex-col items-center justify-center p-8 bg-bg rounded-xl border border-amber">
          <Loader2 className="w-8 h-8 animate-spin text-amber mb-3" />
          <p className="text-sm font-medium text-ink">Parsing JSON file...</p>
        </div>
      )}

      {status === 'ready' && (
        <div className="flex flex-col items-center justify-center p-8 bg-bg rounded-xl border border-amber">
          <CheckCircle className="w-8 h-8 text-green-500 mb-3" />
          <p className="text-sm font-medium text-ink mb-1">Ready to import</p>
          <p className="text-xs text-muted mb-4">Found {videos.length.toLocaleString()} videos in your history.</p>
          <button 
            onClick={startImport}
            className="px-6 py-2 bg-amber text-bg font-semibold rounded-lg hover:brightness-110 transition-colors"
          >
            Start Import
          </button>
        </div>
      )}

      {status === 'importing' && (
        <div className="flex flex-col p-8 bg-bg rounded-xl border border-amber">
          <div className="flex justify-between text-sm font-medium text-ink mb-2">
            <span>Importing...</span>
            <span>{progress.toLocaleString()} / {videos.length.toLocaleString()}</span>
          </div>
          <div className="w-full h-2 bg-surface-alt rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber transition-all duration-300"
              style={{ width: `${(progress / videos.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-4 text-center">
            Please keep this tab open until the import finishes.
          </p>
        </div>
      )}

      {status === 'done' && (
        <div className="flex flex-col items-center justify-center p-8 bg-bg rounded-xl border border-amber">
          <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
          <p className="text-base font-bold text-ink mb-1">Import Complete!</p>
          <p className="text-sm text-muted text-center">
            Successfully imported {videos.length.toLocaleString()} videos to your profile.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-rec/10 text-rec text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}
    </div>
  )
}
