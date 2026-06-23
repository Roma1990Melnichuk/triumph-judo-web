'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Newspaper, Pin, ChevronRight } from 'lucide-react'
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { formatDate } from '@/lib/utils'

interface Post {
  id: string; title: string; content: string
  authorName: string; createdAt: Date; isPinned: boolean
}

export function HomeNews() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'club_posts'), orderBy('createdAt', 'desc'), limit(3))
    return onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => {
        const data = d.data() as Record<string, unknown>
        return {
          id: d.id,
          title: (data.title as string) ?? '',
          content: (data.content as string) ?? '',
          authorName: (data.authorName as string) ?? '',
          createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
          isPinned: (data.isPinned as boolean) ?? false,
        }
      }))
      setLoading(false)
    })
  }, [])

  return (
    <div className="rounded-[24px] p-5 flex flex-col gap-4"
         style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper size={16} className="text-[#FF6A00]" />
          <span className="font-display font-black text-[#F5F5F5] text-base uppercase tracking-wide">Новини</span>
        </div>
        <Link href="/news" className="text-[#FF6A00] text-xs font-semibold hover:text-[#FFC400] transition-colors flex items-center gap-1">
          ВСІ <ChevronRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-[#1A120F] animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-6 text-[#9A9692] text-sm">
          <Newspaper size={28} className="mx-auto mb-2 opacity-30" />
          <p>Новин поки немає</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map(post => (
            <Link key={post.id} href="/news"
                  className="block p-3 rounded-[14px] border border-[#2A1810] hover:bg-[#1A120F] transition-colors">
              <div className="flex items-start gap-2">
                {post.isPinned && <Pin size={11} className="text-[#FFC400] mt-0.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-[#F5F5F5] text-xs font-semibold line-clamp-2 leading-snug">{post.title}</p>
                  <p className="text-[#9A9692] text-[10px] mt-1">{post.authorName} · {formatDate(post.createdAt)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
