'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp, doc, updateDoc } from 'firebase/firestore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { Pin, Plus, Heart, Newspaper } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

interface PostDoc {
  id: string
  title: string
  content: string
  authorId: string
  authorName: string
  createdAt: Date
  isPinned: boolean
  isVisible: boolean
  likes: number
}

export default function NewsPage() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'
  const [posts, setPosts] = useState<PostDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', isPinned: false })

  useEffect(() => {
    const q = query(collection(db, 'club_posts'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const raw = snap.docs.map(d => {
        const data = d.data() as Record<string, unknown>
        return {
          id: d.id,
          title: (data.title as string) ?? '',
          content: (data.content as string) ?? '',
          authorId: (data.authorId as string) ?? '',
          authorName: (data.authorName as string) ?? '',
          createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
          isPinned: (data.isPinned as boolean) ?? false,
          isVisible: (data.isVisible as boolean) ?? true,
          likes: (data.likes as number) ?? 0,
        }
      }).filter(p => p.isVisible)
      // pinned first
      raw.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
      setPosts(raw)
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userModel) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'club_posts'), {
        title: form.title,
        content: form.content,
        authorId: userModel.uid,
        authorName: userModel.name,
        createdAt: serverTimestamp(),
        isPinned: form.isPinned,
        isVisible: true,
        likes: 0,
      })
      toast.success('Публікацію додано')
      setShowAdd(false)
      setForm({ title: '', content: '', isPinned: false })
    } catch {
      toast.error('Помилка')
    } finally {
      setSaving(false)
    }
  }

  const togglePin = async (postId: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'club_posts', postId), { isPinned: !current })
      toast.success(current ? 'Відкріплено' : 'Закріплено')
    } catch {
      toast.error('Помилка')
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F7F5F2]">Новини клубу</h1>
          <p className="text-sm text-[#746E68]">{posts.length} публікацій</p>
        </div>
        {isCoach && <Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} className="mr-1" />Написати</Button>}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-[#120605] animate-pulse" />)}</div>
      ) : posts.length === 0 ? (
        <div className="p-10 text-center">
          <Newspaper size={32} className="mx-auto mb-3 text-[#746E68]" />
          <p className="text-sm text-[#746E68]">Публікацій поки немає</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className={`p-4 rounded-2xl border ${post.isPinned ? 'bg-[#1B0A08] border-[#FFD21A]/20' : 'bg-[#120605] border-[#2A1410]'}`}>
              <div className="flex items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.isPinned && (
                      <Badge variant="gold" className="text-[10px]"><Pin size={9} className="mr-0.5" />Закріплено</Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-[#F7F5F2]">{post.title}</h3>
                </div>
                {isCoach && (
                  <button onClick={() => togglePin(post.id, post.isPinned)}
                    className={`p-1.5 rounded-lg transition-colors shrink-0 ${post.isPinned ? 'text-[#FFD21A] bg-[#FFD21A]/10' : 'text-[#746E68] hover:text-[#FFD21A] hover:bg-[#FFD21A]/10'}`}>
                    <Pin size={13} />
                  </button>
                )}
              </div>
              <p className="text-sm text-[#B7B0A8] leading-relaxed whitespace-pre-line">{post.content}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2A1410]">
                <div>
                  <p className="text-xs text-[#746E68]">{post.authorName}</p>
                  <p className="text-xs text-[#746E68]">{formatDate(post.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-[#746E68]">
                  <Heart size={13} />
                  <span>{post.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} title="Нова публікація">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label="Заголовок" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Вітаємо наших чемпіонів!" />
          <div>
            <label className="block text-sm text-[#B7B0A8] mb-1.5">Текст</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              required
              rows={5}
              placeholder="Текст публікації..."
              className="w-full px-3 py-2.5 bg-[#1B0A08] border border-[#2A1410] rounded-xl text-sm text-[#F7F5F2] placeholder-[#746E68] focus:outline-none focus:border-[#FFD21A] resize-none"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isPinned} onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))} className="w-4 h-4 rounded accent-[#FFD21A]" />
            <span className="text-sm text-[#B7B0A8]">Закріпити публікацію</span>
          </label>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Скасувати</Button>
            <Button type="submit" loading={saving}>Опублікувати</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
