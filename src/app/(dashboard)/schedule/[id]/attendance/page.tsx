'use client'

import { use, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useGroupById } from '@/lib/hooks/useGroups'
import { useChildrenByIds } from '@/lib/hooks/useChildren'
import { useGroupAttendance, saveAttendance, isPresent } from '@/lib/hooks/useAttendance'
import { Avatar } from '@/components/ui/avatar'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const UA_DAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

function getWeekDates(): Date[] {
  const today = new Date()
  const dow = today.getDay()
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function jsDayToMon(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

export default function AttendancePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: groupId } = use(params as unknown as Promise<{ id: string }>)
  const router = useRouter()
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'

  const today = new Date()
  const weekDates = useMemo(() => getWeekDates(), [])

  const [selectedIdx, setSelectedIdx] = useState<number>(() => {
    const dow = today.getDay()
    return dow === 0 ? 6 : dow - 1
  })

  const selectedDate = weekDates[selectedIdx]
  const dateStr = toDateStr(selectedDate)

  const { group, loading: groupLoading } = useGroupById(groupId)
  const { children, loading: childrenLoading } = useChildrenByIds(group?.childIds ?? [])
  const { session, loading: sessionLoading } = useGroupAttendance(groupId, dateStr)

  const [localAttendance, setLocalAttendance] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

  const getPresence = useCallback(
    (childId: string): boolean => {
      if (childId in localAttendance) return localAttendance[childId]
      return isPresent(session, childId)
    },
    [localAttendance, session]
  )

  const toggle = (childId: string) => {
    const current = getPresence(childId)
    setLocalAttendance(prev => ({ ...prev, [childId]: !current }))
  }

  const handleSave = async () => {
    if (!userModel) return
    setSaving(true)
    try {
      const base: Record<string, boolean> = {}
      children.forEach(c => { base[c.id] = getPresence(c.id) })
      await saveAttendance(groupId, userModel.uid, selectedDate, base)
      setLocalAttendance({})
      toast.success('Збережено')
    } catch {
      toast.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  const presentCount = children.filter(c => getPresence(c.id)).length
  const totalCount = children.length

  if (!isCoach) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="tr-card p-10 text-center">
          <p className="text-[#9A9692] text-sm">Тільки для тренерів</p>
        </div>
      </div>
    )
  }

  const loading = groupLoading || childrenLoading || sessionLoading

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-[12px] bg-[#12100F] border border-[#34201A] flex items-center justify-center text-[#9A9692] hover:text-[#F5F5F5] transition-colors shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl font-display font-black text-[#F5F5F5] leading-tight truncate">Відвідуваність</h1>
          {group && <p className="text-xs text-[#9A9692] truncate mt-0.5">{group.name}</p>}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date, idx) => {
          const isActive = idx === selectedIdx
          const isToday = toDateStr(date) === toDateStr(today)
          return (
            <button
              key={idx}
              onClick={() => { setSelectedIdx(idx); setLocalAttendance({}) }}
              className={`flex flex-col items-center py-2.5 rounded-[14px] transition-all text-center ${
                isActive ? 'text-white font-bold' : 'bg-[#12100F] text-[#9A9692] border border-[#34201A] hover:bg-[#1A120F]'
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

      {!loading && totalCount > 0 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-[#9A9692]">
            Присутні: <span className="font-bold text-[#F5F5F5]">{presentCount} / {totalCount}</span>
          </p>
          {session && (
            <span className="text-xs text-[#FFC400] bg-[#FFC400]/10 rounded-full px-2.5 py-0.5">Збережено</span>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-[20px] bg-[#12100F] animate-pulse" />)}
        </div>
      ) : totalCount === 0 ? (
        <div className="tr-card p-10 text-center">
          <p className="text-sm text-[#9A9692]">У цій групі немає учасників</p>
        </div>
      ) : (
        <div className="tr-card overflow-hidden">
          {children.map((child, i) => {
            const present = getPresence(child.id)
            return (
              <div
                key={child.id}
                className={`flex items-center justify-between gap-3 px-4 py-3 transition-colors ${i < children.length - 1 ? 'border-b border-[#34201A]' : ''}`}
                style={!present ? { backgroundColor: 'rgba(227,6,19,0.08)' } : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={`${child.firstName} ${child.lastName}`} photoUrl={child.photoUrl} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#F5F5F5] truncate">{child.firstName} {child.lastName}</p>
                    <p className="text-xs text-[#9A9692]">{child.birthYear}</p>
                  </div>
                </div>
                <button onClick={() => toggle(child.id)} className="shrink-0 transition-transform active:scale-90">
                  {present
                    ? <CheckCircle size={26} className="text-[#22c55e]" />
                    : <XCircle size={26} className="text-[#E30613]" />}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {totalCount > 0 && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="tr-btn-brand w-full h-12 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Збереження...' : 'Зберегти відвідуваність'}
        </button>
      )}
    </div>
  )
}
