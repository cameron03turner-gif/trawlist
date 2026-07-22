'use client'

import { useState, useEffect } from 'react'
import { X, Plus, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Props = {
  videoUrl: string
  onClose: () => void
}

export function SaveToListModal({ videoUrl, onClose }: Props) {
  const router = useRouter()
  const supabase = createClient()
  
  const [lists, setLists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSignedOut, setIsSignedOut] = useState(false)
  const [savingToListId, setSavingToListId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsSignedOut(true)
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('lists')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
      
      if (data) {
        setLists(data)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleAddToList(listId: string) {
    if (savingToListId) return
    setSavingToListId(listId)
    try {
      const res = await fetch(`/api/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl })
      })
      if (res.ok) {
        router.refresh()
        onClose()
      } else {
        const d = await res.json()
        alert(d.error || 'Failed to add to list')
      }
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSavingToListId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-surface border border-amber rounded-2xl shadow-[0_0_40px_rgba(251,191,36,0.1)] p-6 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Save to List</h2>
          <button onClick={onClose} className="p-2 text-muted hover:text-amber hover:bg-surface-alt bg-bg border border-amber/20 rounded-full transition-colors">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-muted border-t-amber rounded-full animate-spin" />
          </div>
        ) : isSignedOut ? (
          <div className="text-center py-8">
            <LogIn className="mx-auto text-amber mb-3" size={32} />
            <h3 className="text-lg font-bold text-ink mb-1">Sign in required</h3>
            <p className="text-muted text-sm mb-6">Please sign in to add videos to custom playlists.</p>
            <Link 
              href="/login"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber text-bg font-bold rounded-xl hover:brightness-110 transition text-sm shadow-md"
            >
              <LogIn size={16} /> Sign in now
            </Link>
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted mb-4">You haven't created any lists yet.</p>
            <a 
              href="/lists"
              onClick={(e) => {
                e.preventDefault()
                onClose()
                router.push('/lists')
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber text-bg font-bold rounded-lg hover:brightness-110 transition text-sm"
            >
              <Plus size={16} /> Create your first list
            </a>
          </div>
        ) : (
          <div className="overflow-y-auto pr-2 space-y-2">
            {lists.map(list => (
              <button
                key={list.id}
                onClick={() => handleAddToList(list.id)}
                disabled={savingToListId !== null}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-bg border border-amber/20 hover:border-amber/50 hover:bg-surface-alt transition-all text-left disabled:opacity-50 group"
              >
                <div>
                  <div className="font-bold mb-0.5 group-hover:text-amber transition-colors">{list.title}</div>
                  <div className="text-xs text-muted">{list.description || 'No description'}</div>
                </div>
                {savingToListId === list.id ? (
                  <div className="w-4 h-4 border-2 border-muted border-t-amber rounded-full animate-spin" />
                ) : (
                  <Plus size={16} className="text-muted group-hover:text-amber transition-colors" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
