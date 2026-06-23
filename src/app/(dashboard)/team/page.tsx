'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useChildren, deleteChild } from '@/lib/hooks/useChildren'
import { Avatar } from '@/components/ui/avatar'
import { BeltBadge } from '@/components/ui/belt-badge'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Search, ChevronRight, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TeamPage() {
  const { userModel } = useAuth()
  const { children, loading } = useChildren(userModel?.uid)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  if (userModel?.role !== 'coach') {
    return <p className="text-[#9A9692]">Тільки для тренерів</p>
  }

  const filtered = children.filter(c => {
    const name = `${c.firstName} ${c.lastName}`.toLowerCase()
    return name.includes(search.toLowerCase())
  })

  const currentYear = new Date().getFullYear()

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
    <div className="space-y-4 max-w-2xl relative pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-black text-[#F5F5F5]">
          {loading ? '—' : `${children.length} спортсменів`}
        </h1>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9692]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Пошук спортсмена..."
          className="w-full h-12 pl-11 pr-4 rounded-[16px] bg-[#12100F] border border-[#34201A] text-[#F5F5F5] placeholder-[#9A9692] text-sm focus:outline-none focus:border-[#E30613]/50 transition-all"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 rounded-[24px] bg-[#12100F] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="tr-card p-12 text-center">
          <Users size={36} className="mx-auto mb-3 text-[#9A9692]" />
          <p className="text-[#9A9692] text-sm">
            {children.length === 0 ? 'Поки немає спортсменів' : 'Нічого не знайдено'}
          </p>
          {children.length === 0 && (
            <Link href="/team/add">
              <button className="tr-btn-brand mt-4 px-5 h-10 text-sm font-bold">
                Додати першого
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="tr-card overflow-hidden">
          {filtered.map((child, idx) => {
            const age = currentYear - child.birthYear
            return (
              <div
                key={child.id}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-[#1A120F] transition-colors group ${idx < filtered.length - 1 ? 'border-b border-[#34201A]' : ''}`}
              >
                <Link href={`/team/${child.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar
                    name={`${child.firstName} ${child.lastName}`}
                    photoUrl={child.photoUrl}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#F5F5F5] truncate">{child.firstName} {child.lastName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <BeltBadge belt={child.currentBelt} size="sm" />
                      <span className="text-xs text-[#9A9692]">
                        {child.weightCategory} · {age} р.
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-sm font-bold text-[#FFC400]">{child.totalPoints} б.</span>
                    <ChevronRight size={12} className="text-[#9A9692]" />
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {/* FAB: fixed on mobile, relative on desktop */}
      <Link
        href="/team/add"
        className="fixed bottom-6 right-6 lg:hidden tr-btn-brand size-14 rounded-full flex items-center justify-center shadow-lg z-50"
        aria-label="Додати спортсмена"
      >
        <Plus size={24} />
      </Link>

      <div className="hidden lg:flex justify-end pt-2">
        <Link href="/team/add">
          <button className="tr-btn-brand px-5 h-10 text-sm font-bold flex items-center gap-2">
            <Plus size={16} /> Додати спортсмена
          </button>
        </Link>
      </div>

      {/* Delete dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Видалити спортсмена?"
      >
        <p className="text-sm text-[#9A9692] mb-5">Цю дію неможливо скасувати.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Скасувати</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Видалити</Button>
        </div>
      </Dialog>
    </div>
  )
}
