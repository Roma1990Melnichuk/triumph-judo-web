'use client'
import Link from 'next/link'
import { Trophy, Crown } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useChildren, useChildrenByIds } from '@/lib/hooks/useChildren'
import { Avatar } from '@/components/ui/avatar'
import { BeltBadge } from '@/components/ui/belt-badge'

export function HomeRating() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'
  const { children: coachChildren, loading: coachLoading } = useChildren(isCoach ? userModel?.uid : undefined)
  const { children: parentChildren, loading: parentLoading } = useChildrenByIds(!isCoach ? (userModel?.childIds ?? []) : [])
  const loading = isCoach ? coachLoading : parentLoading
  const sorted = [...(isCoach ? coachChildren : parentChildren)].sort((a, b) => b.totalPoints - a.totalPoints)
  const [top1, top2, top3] = [sorted[0], sorted[1], sorted[2]]
  const rest = sorted.slice(3, 8)

  return (
    <div className="rounded-[24px] p-5 flex flex-col gap-4"
         style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-[#FFC400]" />
          <span className="font-display font-black text-[#F5F5F5] text-base uppercase tracking-wide">Рейтинг клубу</span>
        </div>
        <Link href="/rating" className="text-[#FF6A00] text-xs font-semibold hover:text-[#FFC400] transition-colors">ВСІ →</Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded-xl bg-[#1A120F] animate-pulse" />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-8 text-[#9A9692] text-sm">Поки немає спортсменів</div>
      ) : (
        <>
          {/* Podium - top 3 */}
          {sorted.length >= 2 && (
            <div className="grid grid-cols-3 gap-2 items-end">
              {/* 2nd */}
              <div className="flex flex-col items-center gap-1.5 bg-[#1A120F] rounded-[16px] p-3 pb-4">
                <Avatar name={top2 ? `${top2.firstName} ${top2.lastName}` : ''} photoUrl={top2?.photoUrl} size="sm" />
                <span className="text-[#F5F5F5] text-[11px] font-semibold text-center leading-tight">
                  {top2?.lastName ?? '—'}
                </span>
                <span className="text-[#FFC400] font-display font-black text-sm">{top2?.totalPoints ?? 0}</span>
                <div className="bg-[#9A9692]/30 rounded-lg px-2 py-0.5">
                  <span className="text-[#9A9692] font-bold text-xs">2</span>
                </div>
              </div>
              {/* 1st — elevated */}
              <div className="flex flex-col items-center gap-1.5 rounded-[16px] p-3 pb-4 -translate-y-2"
                   style={{ background: 'linear-gradient(160deg, #2A1A08 0%, #1A100A 100%)', border: '1px solid #FFC40044' }}>
                <Crown size={14} className="text-[#FFC400]" />
                <Avatar name={top1 ? `${top1.firstName} ${top1.lastName}` : ''} photoUrl={top1?.photoUrl} size="sm" />
                <span className="text-[#F5F5F5] text-[11px] font-bold text-center leading-tight">{top1?.lastName ?? '—'}</span>
                <span className="text-[#FFC400] font-display font-black text-base">{top1?.totalPoints ?? 0}</span>
                <div className="rounded-lg px-2 py-0.5" style={{ background: 'linear-gradient(90deg, #FFC400, #FF6A00)' }}>
                  <span className="text-black font-black text-xs">1</span>
                </div>
              </div>
              {/* 3rd */}
              <div className="flex flex-col items-center gap-1.5 bg-[#1A120F] rounded-[16px] p-3 pb-4">
                <Avatar name={top3 ? `${top3.firstName} ${top3.lastName}` : ''} photoUrl={top3?.photoUrl} size="sm" />
                <span className="text-[#F5F5F5] text-[11px] font-semibold text-center leading-tight">
                  {top3?.lastName ?? '—'}
                </span>
                <span className="text-[#FFC400] font-display font-black text-sm">{top3?.totalPoints ?? 0}</span>
                <div className="bg-[#8B4513]/40 rounded-lg px-2 py-0.5">
                  <span className="text-[#CD7F32] font-bold text-xs">3</span>
                </div>
              </div>
            </div>
          )}

          {/* Rest of table */}
          {rest.length > 0 && (
            <div className="space-y-1">
              {rest.map((child, i) => (
                <div key={child.id} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[#1A120F] transition-colors">
                  <span className="text-[#9A9692] text-xs font-bold w-5 text-center">{i + 4}</span>
                  <Avatar name={`${child.firstName} ${child.lastName}`} photoUrl={child.photoUrl} size="sm" />
                  <span className="flex-1 text-[#D0CBC6] text-xs font-medium truncate">{child.lastName} {child.firstName}</span>
                  <span className="text-[#FFC400] text-xs font-bold font-display">{child.totalPoints}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
