'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, CalendarDays, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useChildCompetitions } from '@/lib/hooks/useCompetitions'
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { formatDate } from '@/lib/utils'
import type { CompetitionResult } from '@/lib/types'

const MEDAL_LABEL: Record<string, string> = {
  gold: '🥇 Золото',
  silver: '🥈 Срібло',
  bronze: '🥉 Бронза',
  none: '',
}
const MEDAL_COLOR: Record<string, string> = {
  gold: '#FFC400',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  none: '#9A9692',
}
const PLACE_BG: Record<number, string> = {
  1: 'linear-gradient(90deg,#FFC400,#FF6A00)',
  2: '#C0C0C020',
  3: '#CD7F3220',
}

function ResultCard({ r }: { r: CompetitionResult }) {
  const medalColor = MEDAL_COLOR[r.medal] ?? '#9A9692'
  return (
    <div className="flex items-center gap-3 p-3 rounded-[14px] bg-[#1A120F] border border-[#2A1810]">
      {/* Place badge */}
      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 font-display font-black text-sm"
           style={{ background: PLACE_BG[r.place] ?? '#2A1810', color: r.place === 1 ? '#000' : medalColor }}>
        {r.place}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#F5F5F5] text-xs font-semibold truncate">{r.competitionName}</p>
        <p className="text-[#9A9692] text-[10px] flex items-center gap-1 mt-0.5">
          <CalendarDays size={10} />
          {formatDate(r.date)}
          {r.weight && <span className="ml-1">· {r.weight}</span>}
        </p>
      </div>
      {r.medal !== 'none' && (
        <span className="text-[10px] font-semibold shrink-0" style={{ color: medalColor }}>
          {MEDAL_LABEL[r.medal]}
        </span>
      )}
    </div>
  )
}

export function HomeTournaments() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'
  const childId = userModel?.childIds?.[0]
  const { results: parentResults, loading: parentLoading } = useChildCompetitions(!isCoach ? childId : undefined)

  // Coach: inline query
  const [coachResults, setCoachResults] = useState<CompetitionResult[]>([])
  const [coachLoading, setCoachLoading] = useState(true)

  useEffect(() => {
    if (!isCoach || !userModel?.uid) { setCoachLoading(false); return }
    const q = query(
      collection(db, 'competition_results'),
      where('coachId', '==', userModel.uid),
      orderBy('date', 'desc'),
      limit(4)
    )
    return onSnapshot(q, snap => {
      setCoachResults(snap.docs.map(d => {
        const data = d.data() as Record<string, unknown>
        return {
          id: d.id,
          childId: (data.childId as string) ?? '',
          competitionName: (data.competitionName as string) ?? '',
          date: (data.date as Timestamp)?.toDate() ?? new Date(),
          place: (data.place as number) ?? 0,
          medal: (data.medal as CompetitionResult['medal']) ?? 'none',
          weight: (data.weight as string) ?? '',
          points: (data.points as number) ?? 0,
          coachId: (data.coachId as string) ?? '',
        }
      }))
      setCoachLoading(false)
    })
  }, [isCoach, userModel?.uid])

  const results = isCoach ? coachResults : parentResults.slice(0, 4)
  const loading = isCoach ? coachLoading : parentLoading

  return (
    <div className="rounded-[24px] p-5 flex flex-col gap-4"
         style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-[#E30613]" />
          <span className="font-display font-black text-[#F5F5F5] text-base uppercase tracking-wide">Турніри</span>
        </div>
        <Link href="/competitions" className="text-[#FF6A00] text-xs font-semibold hover:text-[#FFC400] transition-colors flex items-center gap-1">
          ВСІ <ChevronRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-[#1A120F] animate-pulse" />)}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-8 text-[#9A9692] text-sm">
          <Trophy size={28} className="mx-auto mb-2 opacity-30" />
          <p>Результатів поки немає</p>
        </div>
      ) : (
        <div className="space-y-2">
          {results.map(r => <ResultCard key={r.id} r={r} />)}
        </div>
      )}
    </div>
  )
}
