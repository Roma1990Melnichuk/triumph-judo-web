'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useChildren, deleteChild } from '@/lib/hooks/useChildren'
import { useGroups } from '@/lib/hooks/useGroups'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { BeltBadge } from '@/components/ui/belt-badge'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { BELT_DISPLAY } from '@/lib/constants'
import { Plus, Search, Trash2, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TeamPage() {
  const { userModel } = useAuth()
  const { children, loading } = useChildren(userModel?.uid)
  const { groups } = useGroups(userModel?.uid)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [beltFilter, setBeltFilter] = useState<string>('all')

  if (userModel?.role !== 'coach') {
    return <p className="text-[#746E68]">Тільки для тренерів</p>
  }

  const filtered = children.filter(c => {
    const name = `${c.firstName} ${c.lastName}`.toLowerCase()
    const matchSearch = name.includes(search.toLowerCase())
    const matchBelt = beltFilter === 'all' || c.currentBelt === beltFilter
    return matchSearch && matchBelt
  })

  const childGroups = (childId: string) => groups.filter(g => g.childIds.includes(childId))

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteChild(deleteId)
      toast.success('Видалено')
      setDeleteId(null)
    } catch {
      toast.error('Помилка видалення')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#746E68]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Пошук спортсмена..."
            className="w-full h-9 pl-8 pr-3 rounded-xl bg-[#1B0A08] border border-[#2A1410] text-sm text-[#F7F5F2] placeholder-[#746E68] focus:outline-none focus:border-[#D50000]/60"
          />
        </div>
        <Link href="/team/add">
          <Button size="sm"><Plus size={14} className="mr-1" />Додати</Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="flex gap-2 text-xs text-[#746E68]">
        <span>{children.length} спортсменів</span>
        <span>·</span>
        <span>{children.filter(c => c.beltReady).length} готові до поясу</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-[#120605] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-[#746E68]">Нічого не знайдено</p>
            {children.length === 0 && (
              <Link href="/team/add">
                <Button className="mt-4" size="sm">Додати першого спортсмена</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(child => {
            const gs = childGroups(child.id)
            return (
              <div key={child.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[#120605] border border-[#2A1410] hover:border-[#2A1410]/60 group">
                <Link href={`/team/${child.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar name={`${child.firstName} ${child.lastName}`} photoUrl={child.photoUrl} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#F7F5F2] truncate">{child.firstName} {child.lastName}</p>
                      {child.beltReady && <Badge variant="gold" className="text-[10px] py-0">Готовий</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <BeltBadge belt={child.currentBelt} />
                      <span className="text-xs text-[#746E68]">{child.weightCategory} · {child.totalPoints} б.</span>
                      {gs.length > 0 && <span className="text-xs text-[#746E68] truncate">{gs.map(g => g.name).join(', ')}</span>}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[#746E68] shrink-0" />
                </Link>
                <button
                  onClick={() => setDeleteId(child.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-[#746E68] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Видалити спортсмена?"
      >
        <p className="text-sm text-[#B7B0A8] mb-5">Цю дію неможливо скасувати.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Скасувати</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Видалити</Button>
        </div>
      </Dialog>
    </div>
  )
}
