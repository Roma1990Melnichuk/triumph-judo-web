'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { CalendarDays, MapPin, Plus, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

interface EventDoc {
  id: string
  title: string
  description: string
  date: Date
  endDate?: Date
  location?: string
  type: 'competition' | 'training' | 'seminar' | 'other'
  coachId: string
}

const TYPE_LABEL: Record<string, string> = {
  competition: 'Змагання', training: 'Тренування',
  seminar: 'Семінар', other: 'Інше',
}
const TYPE_VARIANT: Record<string, 'error' | 'success' | 'gold' | 'default'> = {
  competition: 'error', training: 'success', seminar: 'gold', other: 'default',
}

const MONTH_NAMES = ['січ','лют','бер','кві','тра','чер','лип','сер','вер','жов','лис','гру']

function DateBlock({ date }: { date: Date }) {
  return (
    <div className="shrink-0 w-12 h-14 rounded-xl bg-[#D50000]/10 border border-[#D50000]/20 flex flex-col items-center justify-center">
      <span className="text-lg font-bold text-[#D50000] leading-none">{date.getDate()}</span>
      <span className="text-[10px] text-[#D50000] uppercase">{MONTH_NAMES[date.getMonth()]}</span>
      <span className="text-[10px] text-[#746E68]">{date.getFullYear()}</span>
    </div>
  )
}

export default function EventsPage() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'
  const [events, setEvents] = useState<EventDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', date: new Date().toISOString().split('T')[0],
    endDate: '', location: '', type: 'competition' as EventDoc['type'],
  })

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => {
        const data = d.data() as Record<string, unknown>
        return {
          id: d.id,
          title: (data.title as string) ?? '',
          description: (data.description as string) ?? '',
          date: (data.date as Timestamp)?.toDate() ?? new Date(),
          endDate: data.endDate ? (data.endDate as Timestamp).toDate() : undefined,
          location: data.location as string | undefined,
          type: (data.type as EventDoc['type']) ?? 'other',
          coachId: (data.coachId as string) ?? '',
        }
      }))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userModel) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'events'), {
        title: form.title,
        description: form.description,
        date: new Date(form.date),
        ...(form.endDate ? { endDate: new Date(form.endDate) } : {}),
        ...(form.location ? { location: form.location } : {}),
        type: form.type,
        coachId: userModel.uid,
        createdAt: serverTimestamp(),
      })
      toast.success('Подію додано')
      setShowAdd(false)
      setForm({ title: '', description: '', date: new Date().toISOString().split('T')[0], endDate: '', location: '', type: 'competition' })
    } catch {
      toast.error('Помилка')
    } finally {
      setSaving(false)
    }
  }

  const upcoming = events.filter(e => e.date >= new Date(new Date().setHours(0,0,0,0)))
  const past = events.filter(e => e.date < new Date(new Date().setHours(0,0,0,0)))

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F7F5F2]">Події</h1>
          <p className="text-sm text-[#746E68]">{upcoming.length} майбутніх</p>
        </div>
        {isCoach && <Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} className="mr-1" />Додати</Button>}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-[#120605] animate-pulse" />)}</div>
      ) : events.length === 0 ? (
        <div className="p-10 text-center">
          <CalendarDays size={32} className="mx-auto mb-3 text-[#746E68]" />
          <p className="text-sm text-[#746E68]">Подій поки немає</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[#746E68] uppercase tracking-wider">Майбутні</p>
              {upcoming.map(ev => (
                <div key={ev.id} className="flex gap-3 p-4 rounded-2xl bg-[#120605] border border-[#2A1410]">
                  <DateBlock date={ev.date} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <p className="font-semibold text-[#F7F5F2] flex-1 leading-tight">{ev.title}</p>
                      <Badge variant={TYPE_VARIANT[ev.type] ?? 'default'} className="text-[10px] shrink-0">{TYPE_LABEL[ev.type]}</Badge>
                    </div>
                    {ev.description && <p className="text-sm text-[#B7B0A8] line-clamp-2">{ev.description}</p>}
                    <div className="flex items-center gap-3 mt-1.5">
                      {ev.location && (
                        <span className="flex items-center gap-1 text-xs text-[#746E68]">
                          <MapPin size={11} /> {ev.location}
                        </span>
                      )}
                      {ev.endDate && (
                        <span className="flex items-center gap-1 text-xs text-[#746E68]">
                          <Clock size={11} /> до {formatDate(ev.endDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[#746E68] uppercase tracking-wider">Минулі</p>
              {past.slice(-5).reverse().map(ev => (
                <div key={ev.id} className="flex gap-3 p-4 rounded-2xl bg-[#0A0302] border border-[#1B0A08] opacity-60">
                  <DateBlock date={ev.date} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <p className="font-semibold text-[#F7F5F2] flex-1 leading-tight">{ev.title}</p>
                      <Badge variant="default" className="text-[10px] shrink-0">{TYPE_LABEL[ev.type]}</Badge>
                    </div>
                    {ev.location && <span className="flex items-center gap-1 text-xs text-[#746E68]"><MapPin size={11} /> {ev.location}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} title="Нова подія">
        <form onSubmit={handleAdd} className="space-y-3">
          <Input label="Назва" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Міський чемпіонат..." />
          <Select label="Тип" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as EventDoc['type'] }))}>
            {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Дата початку" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            <Input label="Дата кінця" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
          <Input label="Місце проведення" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Київ, СК Олімпієць..." />
          <Input label="Опис" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Деталі події..." />
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Скасувати</Button>
            <Button type="submit" loading={saving}>Додати</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
