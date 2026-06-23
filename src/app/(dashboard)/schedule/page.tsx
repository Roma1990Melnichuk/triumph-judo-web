'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useGroups, saveGroup } from '@/lib/hooks/useGroups'
import { useChildrenByIds } from '@/lib/hooks/useChildren'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DAY_NAMES } from '@/lib/constants'
import { Plus, Users, Flame, CalendarDays, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const UA_DAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

/** Returns Monday-based Date for the current week's day index (0=Mon..6=Sun) */
function getWeekDates(): Date[] {
  const today = new Date()
  const dow = today.getDay() // 0=Sun..6=Sat
  // Convert to Mon=0..Sun=6
  const mondayOffset = (dow === 0 ? -6 : 1 - dow)
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

/** Convert JS getDay() (0=Sun) to our Mon-based day number (1=Mon..7=Sun) */
function jsDayToMon(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay
}

export default function SchedulePage() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'
  const { groups, loading } = useGroups(isCoach ? userModel?.uid : undefined)
  const { children: myChildren } = useChildrenByIds(isCoach ? [] : (userModel?.childIds ?? []))

  const today = new Date()
  const todayMon = jsDayToMon(today.getDay()) // 1..7

  const [selectedDow, setSelectedDow] = useState<number>(todayMon)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    daysOfWeek: [] as number[],
    timeStart: '18:00',
    timeEnd: '19:30',
  })

  const weekDates = useMemo(() => getWeekDates(), [])

  const toggleDay = (d: number) => {
    setForm(f => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(d)
        ? f.daysOfWeek.filter(x => x !== d)
        : [...f.daysOfWeek, d].sort(),
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

  // Sessions for selected day of week
  const dayGroups = myGroups
    .filter(g => g.daysOfWeek.includes(selectedDow))
    .sort((a, b) => a.timeStart.localeCompare(b.timeStart))

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-black text-[#F5F5F5]">Розклад</h1>
        {isCoach && (
          <button
            onClick={() => setShowAdd(true)}
            className="tr-btn-brand px-4 h-10 text-sm font-bold flex items-center gap-2"
          >
            <Plus size={16} /> Нова група
          </button>
        )}
      </div>

      {/* Week day pills */}
      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date, idx) => {
          const dowNum = idx + 1 // 1=Mon..7=Sun
          const isActive = dowNum === selectedDow
          const isToday = jsDayToMon(date.getDay()) === todayMon
          return (
            <button
              key={idx}
              onClick={() => setSelectedDow(dowNum)}
              className={`flex flex-col items-center py-2.5 rounded-[14px] transition-all text-center ${
                isActive
                  ? 'text-white font-bold'
                  : 'bg-[#12100F] text-[#9A9692] border border-[#34201A] hover:bg-[#1A120F]'
              }`}
              style={isActive ? { background: 'linear-gradient(90deg,#E30613 0%,#FF6A00 58%,#FFC400 100%)' } : undefined}
            >
              <span className="text-[10px] font-semibold leading-none">{UA_DAY_SHORT[idx]}</span>
              <span className={`text-base font-bold leading-tight mt-0.5 ${isToday && !isActive ? 'text-[#FF6A00]' : ''}`}>
                {date.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      {/* Sessions for selected day */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-[24px] bg-[#12100F] animate-pulse" />
          ))}
        </div>
      ) : dayGroups.length === 0 ? (
        <div className="tr-card p-12 text-center">
          <CalendarDays size={36} className="mx-auto mb-3 text-[#9A9692]" />
          <p className="text-sm text-[#9A9692]">Тренувань немає</p>
          {isCoach && (
            <button
              onClick={() => setShowAdd(true)}
              className="tr-btn-brand mt-4 px-5 h-10 text-sm font-bold inline-flex items-center gap-2"
            >
              <Plus size={16} /> Додати
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {dayGroups.map(group => (
            <div key={group.id} className="tr-card-glow p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Time */}
                  <p className="text-xl font-display font-bold text-[#F5F5F5]">
                    {group.timeStart} – {group.timeEnd}
                  </p>
                  {/* Group name */}
                  <p className="text-sm font-semibold text-[#F5F5F5] mt-1">{group.name}</p>
                  {/* Location placeholder */}
                  <p className="text-xs text-[#9A9692] mt-0.5 flex items-center gap-1">
                    <Clock size={11} /> Залл ТРІУМФ
                  </p>
                  {/* Athlete count chip */}
                  <div className="flex items-center gap-1 mt-2">
                    <span className="inline-flex items-center gap-1 bg-[#34201A] rounded-full px-2.5 py-0.5 text-xs text-[#9A9692]">
                      <Users size={11} /> {group.childIds.length} уч.
                    </span>
                  </div>
                </div>
                <Flame size={24} className="text-[#FF6A00] shrink-0 mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add group dialog */}
      <Dialog open={showAdd} onClose={() => setShowAdd(false)} title="Нова група">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Назва групи"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Юніори, Кадети..."
            required
          />
          <div>
            <p className="text-sm text-[#9A9692] mb-2">Дні тижня</p>
            <div className="flex gap-2 flex-wrap">
              {DAY_NAMES.map((day, idx) => {
                const dayNum = idx + 1
                const active = form.daysOfWeek.includes(dayNum)
                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => toggleDay(dayNum)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${
                      active
                        ? 'text-white'
                        : 'bg-[#1A120F] text-[#9A9692] border border-[#34201A] hover:bg-[#34201A]'
                    }`}
                    style={active ? { background: 'linear-gradient(90deg,#E30613 0%,#FF6A00 58%,#FFC400 100%)' } : undefined}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Початок"
              type="time"
              value={form.timeStart}
              onChange={e => setForm(f => ({ ...f, timeStart: e.target.value }))}
            />
            <Input
              label="Кінець"
              type="time"
              value={form.timeEnd}
              onChange={e => setForm(f => ({ ...f, timeEnd: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>
              Скасувати
            </Button>
            <Button type="submit" loading={saving}>Створити</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
