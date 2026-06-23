'use client'
import Link from 'next/link'
import { CalendarDays, Clock, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useGroups } from '@/lib/hooks/useGroups'
import { DAY_NAMES } from '@/lib/constants'
import type { GroupModel } from '@/lib/types'

const DAY_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд']

// jsDay: 0=Sun,1=Mon..6=Sat → 0=Mon..6=Sun index
function jsDayToIdx(jsDay: number): number { return jsDay === 0 ? 6 : jsDay - 1 }

function getDayGroups(groups: GroupModel[], dayIdx: number): GroupModel[] {
  return groups.filter(g => g.daysOfWeek.includes(dayIdx + 1) || g.daysOfWeek.includes(dayIdx === 6 ? 0 : dayIdx + 1))
}

// daysOfWeek in GroupModel uses 1=Mon..7=Sun or 0=Sun? Check constants — DAY_NAMES[0] should be Monday
// Use safe match: groups that have dayIdx (0-based Mon) in daysOfWeek
function groupsForDay(groups: GroupModel[], dayIdx: number): GroupModel[] {
  // Try both conventions: 0-indexed and 1-indexed
  return groups.filter(g =>
    g.daysOfWeek.includes(dayIdx) || g.daysOfWeek.includes(dayIdx + 1)
  )
}

export function HomeCalendar() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'
  const { groups, loading } = useGroups(isCoach ? userModel?.uid : undefined)

  const todayIdx = jsDayToIdx(new Date().getDay())

  // Build 7-day grid
  const weekDays = Array.from({ length: 7 }, (_, i) => ({
    idx: i,
    short: DAY_SHORT[i],
    groups: groupsForDay(groups, i),
    isToday: i === todayIdx,
  }))

  return (
    <div className="rounded-[24px] p-5 flex flex-col gap-4"
         style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-[#FF6A00]" />
          <span className="font-display font-black text-[#F5F5F5] text-base uppercase tracking-wide">Розклад</span>
        </div>
        <Link href="/schedule" className="text-[#FF6A00] text-xs font-semibold hover:text-[#FFC400] transition-colors flex items-center gap-1">
          ВСІ <ChevronRight size={14} />
        </Link>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(({ idx, short, isToday }) => (
          <div key={idx}
               className={`flex flex-col items-center py-2 px-1 rounded-[12px] text-center transition-all ${
                 isToday ? 'text-white font-bold' : 'bg-[#1A120F] text-[#9A9692]'
               }`}
               style={isToday ? { background: 'linear-gradient(90deg,#E30613 0%,#FF6A00 58%,#FFC400 100%)' } : undefined}>
            <span className="text-[9px] font-semibold leading-none">{short}</span>
          </div>
        ))}
      </div>

      {/* Today's schedule */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => <div key={i} className="h-10 rounded-xl bg-[#1A120F] animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {weekDays[todayIdx].groups.length === 0 ? (
            <div className="text-center py-4 text-[#9A9692] text-sm">Сьогодні відпочинок 🧘</div>
          ) : weekDays[todayIdx].groups.map(g => (
            <div key={g.id} className="flex items-center gap-2 bg-[#1A120F] rounded-[12px] px-3 py-2 border border-[#2A1810]">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'linear-gradient(135deg,#E30613,#FF6A00)' }} />
              <span className="flex-1 text-[#F5F5F5] text-xs font-semibold truncate">{g.name}</span>
              <span className="text-[#9A9692] text-[10px] flex items-center gap-0.5 shrink-0">
                <Clock size={10} />{g.timeStart}–{g.timeEnd}
              </span>
            </div>
          ))}

          {/* This week summary */}
          <div className="grid grid-cols-7 gap-1 mt-1">
            {weekDays.map(({ idx, groups: gs, isToday }) => (
              <div key={idx}
                   className={`rounded-[8px] py-1 flex flex-col items-center gap-0.5 ${
                     gs.length > 0 ? 'bg-[#E30613]/15 border border-[#E30613]/25' : 'bg-[#1A120F]'
                   }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${gs.length > 0 ? 'bg-[#E30613]' : 'bg-[#2A1810]'}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      <Link href="/schedule" className="text-center text-xs font-semibold text-[#FF6A00] hover:text-[#FFC400] transition-colors">
        Повний розклад →
      </Link>
    </div>
  )
}
