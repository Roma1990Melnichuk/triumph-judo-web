'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useGroups, saveGroup, getDaysLabel } from '@/lib/hooks/useGroups'
import { useChildrenByIds } from '@/lib/hooks/useChildren'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { DAY_NAMES } from '@/lib/constants'
import { Plus, Clock, Users, ChevronRight, CalendarDays } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SchedulePage() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'
  const { groups, loading } = useGroups(isCoach ? userModel?.uid : undefined)
  const { children: myChildren } = useChildrenByIds(isCoach ? [] : (userModel?.childIds ?? []))

  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', daysOfWeek: [] as number[], timeStart: '18:00', timeEnd: '19:30' })

  const toggleDay = (d: number) => {
    setForm(f => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(d) ? f.daysOfWeek.filter(x => x !== d) : [...f.daysOfWeek, d].sort()
    }))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userModel) return
    if (!form.name.trim()) { toast.error('Введіть назву групи'); return }
    setSaving(true)
    try {
      await saveGroup({ ...form, coachId: userModel.uid, childIds: [] })
      toast.success('Групу створено')
      setShowAdd(false)
      setForm({ name: '', daysOfWeek: [], timeStart: '18:00', timeEnd: '19:30' })
    } catch {
      toast.error('Помилка')
    } finally {
      setSaving(false)
    }
  }

  const myGroups = isCoach
    ? groups
    : groups.filter(g => myChildren.some(c => g.childIds.includes(c.id)))

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F7F5F2]">Розклад</h1>
          <p className="text-sm text-[#746E68]">{myGroups.length} груп</p>
        </div>
        {isCoach && (
          <Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} className="mr-1" />Нова група</Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-[#120605] animate-pulse" />)}
        </div>
      ) : myGroups.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <CalendarDays size={32} className="mx-auto mb-3 text-[#746E68]" />
            <p className="text-sm text-[#746E68]">{isCoach ? 'Груп поки немає. Створіть першу групу.' : 'Вас не додано до жодної групи'}</p>
            {isCoach && <Button size="sm" className="mt-4" onClick={() => setShowAdd(true)}>Створити групу</Button>}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {myGroups.map(group => (
            <Link key={group.id} href={`/schedule/${group.id}`}>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#120605] border border-[#2A1410] hover:border-[#D50000]/40 transition-colors cursor-pointer">
                <div className="size-10 rounded-xl bg-[#D50000]/10 flex items-center justify-center shrink-0">
                  <CalendarDays size={18} className="text-[#D50000]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#F7F5F2]">{group.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-[#B7B0A8]">
                      <Clock size={11} /> {group.timeStart}–{group.timeEnd}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#B7B0A8]">
                      <Users size={11} /> {group.childIds.length}
                    </span>
                    {group.daysOfWeek.length > 0 && (
                      <span className="text-xs text-[#746E68]">{getDaysLabel(group.daysOfWeek)}</span>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#746E68] shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} title="Нова група">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label="Назва групи" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Юніори, Кадети..." required />
          <div>
            <p className="text-sm text-[#B7B0A8] mb-2">Дні тижня</p>
            <div className="flex gap-2 flex-wrap">
              {DAY_NAMES.map((day, idx) => {
                const dayNum = idx + 1
                const active = form.daysOfWeek.includes(dayNum)
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
            <Input label="Початок" type="time" value={form.timeStart} onChange={e => setForm(f => ({ ...f, timeStart: e.target.value }))} />
            <Input label="Кінець" type="time" value={form.timeEnd} onChange={e => setForm(f => ({ ...f, timeEnd: e.target.value }))} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Скасувати</Button>
            <Button type="submit" loading={saving}>Створити</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
