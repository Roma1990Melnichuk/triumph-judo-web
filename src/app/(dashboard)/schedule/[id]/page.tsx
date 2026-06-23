'use client'

import { use, useState, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useGroupById, saveGroup, deleteGroup, addChildToGroup, removeChildFromGroup, getDaysLabel } from '@/lib/hooks/useGroups'
import { useChildren, useChildrenByIds } from '@/lib/hooks/useChildren'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { BeltBadge } from '@/components/ui/belt-badge'
import { Dialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { DAY_NAMES } from '@/lib/constants'
import { ArrowLeft, Pencil, Trash2, Plus, X, Clock, Users, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { userModel } = useAuth()
  const router = useRouter()
  const isCoach = userModel?.role === 'coach'
  const { group, loading } = useGroupById(id)
  const { children: allChildren } = useChildren(isCoach ? userModel?.uid : undefined)
  const { children: groupChildren, loading: childrenLoading } = useChildrenByIds(group?.childIds ?? [])

  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', daysOfWeek: [] as number[], timeStart: '', timeEnd: '' })
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [addSearch, setAddSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const startEdit = () => {
    if (!group) return
    setEditForm({ name: group.name, daysOfWeek: [...group.daysOfWeek], timeStart: group.timeStart, timeEnd: group.timeEnd })
    setEditing(true)
  }

  const toggleDay = (d: number) => {
    setEditForm(f => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(d) ? f.daysOfWeek.filter(x => x !== d) : [...f.daysOfWeek, d].sort()
    }))
  }

  const handleSave = async () => {
    if (!group || !userModel) return
    setSaving(true)
    try {
      await saveGroup({ ...group, ...editForm })
      toast.success('Збережено')
      setEditing(false)
    } catch {
      toast.error('Помилка')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteGroup(id)
      toast.success('Групу видалено')
      router.push('/schedule')
    } catch {
      toast.error('Помилка видалення')
    } finally {
      setDeleting(false)
    }
  }

  const handleAdd = async (childId: string) => {
    try {
      await addChildToGroup(id, childId)
      toast.success('Додано')
    } catch {
      toast.error('Помилка')
    }
  }

  const handleRemove = async (childId: string) => {
    try {
      await removeChildFromGroup(id, childId)
      toast.success('Видалено з групи')
    } catch {
      toast.error('Помилка')
    }
  }

  const notInGroup = useMemo(() => {
    if (!group) return []
    return allChildren.filter(c => !group.childIds.includes(c.id) && `${c.firstName} ${c.lastName}`.toLowerCase().includes(addSearch.toLowerCase()))
  }, [allChildren, group, addSearch])

  if (loading) return (
    <div className="max-w-2xl space-y-3">
      <div className="h-8 w-40 rounded-xl bg-[#120605] animate-pulse" />
      <div className="h-40 rounded-2xl bg-[#120605] animate-pulse" />
    </div>
  )

  if (!group) return <p className="text-sm text-[#746E68]">Групу не знайдено</p>

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/schedule" className="flex items-center gap-1.5 text-sm text-[#746E68] hover:text-[#F7F5F2] transition-colors">
          <ArrowLeft size={14} /> Розклад
        </Link>
        {isCoach && (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={startEdit}><Pencil size={13} className="mr-1" />Редагувати</Button>
            <Button size="sm" variant="danger" onClick={() => setShowDelete(true)}><Trash2 size={13} /></Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-5">
          <h1 className="text-xl font-bold text-[#F7F5F2] mb-3">{group.name}</h1>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-[#B7B0A8]">
              <Clock size={14} className="text-[#746E68]" />
              {group.timeStart}–{group.timeEnd}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#B7B0A8]">
              <Users size={14} className="text-[#746E68]" />
              {group.childIds.length} спортсменів
            </div>
          </div>
          {group.daysOfWeek.length > 0 && (
            <div className="flex gap-1.5 mt-3">
              {DAY_NAMES.map((day, idx) => {
                const active = group.daysOfWeek.includes(idx + 1)
                return (
                  <span key={idx} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold ${active ? 'bg-[#D50000]/20 text-[#D50000]' : 'bg-[#1B0A08] text-[#746E68]'}`}>
                    {day}
                  </span>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[#F7F5F2]">Спортсмени</h2>
        {isCoach && <Button size="sm" variant="secondary" onClick={() => setShowAdd(true)}><Plus size={13} className="mr-1" />Додати</Button>}
      </div>

      {childrenLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-2xl bg-[#120605] animate-pulse" />)}</div>
      ) : groupChildren.length === 0 ? (
        <p className="text-sm text-[#746E68]">У цій групі ще немає спортсменів</p>
      ) : (
        <div className="space-y-2">
          {groupChildren.map(child => (
            <div key={child.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[#120605] border border-[#2A1410]">
              <Avatar name={`${child.firstName} ${child.lastName}`} photoUrl={child.photoUrl} size="md" />
              <Link href={`/team/${child.id}`} className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#F7F5F2]">{child.firstName} {child.lastName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <BeltBadge belt={child.currentBelt} />
                  <span className="text-xs text-[#746E68]">{child.weightCategory}</span>
                </div>
              </Link>
              {isCoach && (
                <button onClick={() => handleRemove(child.id)} className="p-1.5 rounded-lg text-[#746E68] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Group Dialog */}
      <Dialog open={editing} onClose={() => setEditing(false)} title="Редагувати групу">
        <div className="space-y-4">
          <Input label="Назва" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
          <div>
            <p className="text-sm text-[#B7B0A8] mb-2">Дні тижня</p>
            <div className="flex gap-2 flex-wrap">
              {DAY_NAMES.map((day, idx) => {
                const dayNum = idx + 1
                const active = editForm.daysOfWeek.includes(dayNum)
                return (
                  <button key={dayNum} type="button" onClick={() => toggleDay(dayNum)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${active ? 'bg-[#D50000] text-white' : 'bg-[#1B0A08] text-[#B7B0A8] hover:bg-[#2A1410]'}`}>
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Початок" type="time" value={editForm.timeStart} onChange={e => setEditForm(f => ({ ...f, timeStart: e.target.value }))} />
            <Input label="Кінець" type="time" value={editForm.timeEnd} onChange={e => setEditForm(f => ({ ...f, timeEnd: e.target.value }))} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setEditing(false)}>Скасувати</Button>
            <Button loading={saving} onClick={handleSave}>Зберегти</Button>
          </div>
        </div>
      </Dialog>

      {/* Add athlete dialog */}
      <Dialog open={showAdd} onClose={() => { setShowAdd(false); setAddSearch('') }} title="Додати спортсмена">
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#746E68]" />
            <input value={addSearch} onChange={e => setAddSearch(e.target.value)} placeholder="Пошук..." className="w-full h-9 pl-8 pr-3 rounded-xl bg-[#1B0A08] border border-[#2A1410] text-sm text-[#F7F5F2] placeholder-[#746E68] focus:outline-none focus:border-[#FFD21A]" />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {notInGroup.length === 0 ? (
              <p className="text-sm text-[#746E68] py-3 text-center">Всіх вже додано або не знайдено</p>
            ) : notInGroup.map(child => (
              <div key={child.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#1B0A08]">
                <Avatar name={`${child.firstName} ${child.lastName}`} size="sm" />
                <span className="flex-1 text-sm text-[#F7F5F2]">{child.firstName} {child.lastName}</span>
                <Button size="sm" variant="secondary" onClick={() => handleAdd(child.id)}>Додати</Button>
              </div>
            ))}
          </div>
        </div>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={showDelete} onClose={() => setShowDelete(false)} title="Видалити групу?">
        <p className="text-sm text-[#B7B0A8] mb-5">Цю дію неможливо скасувати.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setShowDelete(false)}>Скасувати</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Видалити</Button>
        </div>
      </Dialog>
    </div>
  )
}
