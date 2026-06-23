'use client'

import { useAuth } from '@/lib/auth-context'
import { useChildren, useChildrenByIds, useChildById } from '@/lib/hooks/useChildren'
import { Avatar } from '@/components/ui/avatar'
import { BeltBadge } from '@/components/ui/belt-badge'
import { Trophy } from 'lucide-react'

export default function RatingPage() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'

  // Coach: load all their athletes. Parent: load children by ids.
  const { children: coachChildren, loading: coachLoading } = useChildren(isCoach ? userModel?.uid : undefined)
  const { children: parentChildren, loading: parentLoading } = useChildrenByIds(!isCoach ? (userModel?.childIds ?? []) : [])
  const { child: myChild, loading: childLoading } = useChildById(!isCoach ? userModel?.childIds?.[0] : undefined)

  const loading = isCoach ? coachLoading : (parentLoading || childLoading)

  // Use correct children source
  const allChildren = isCoach ? coachChildren : parentChildren
  const sorted = [...allChildren].sort((a, b) => b.totalPoints - a.totalPoints)
  const myChildRank = myChild ? sorted.findIndex(c => c.id === myChild.id) + 1 : null

  const top1 = sorted[0]
  const top2 = sorted[1]
  const top3 = sorted[2]
  const rest = sorted.slice(3)

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Trophy size={22} className="text-[#FFC400]" />
        <h1 className="text-2xl font-display font-black text-[#F5F5F5]">Рейтинг</h1>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 rounded-[24px] bg-[#12100F] animate-pulse" />
          ))}
        </div>
      ) : isCoach ? (
        sorted.length === 0 ? (
          <div className="tr-card p-12 text-center">
            <Trophy size={36} className="mx-auto mb-3 text-[#9A9692]" />
            <p className="text-sm text-[#9A9692]">Спортсменів поки немає</p>
          </div>
        ) : (
          <>
            {/* Podium — top 3 */}
            {sorted.length >= 2 && (
              <div className="grid grid-cols-3 gap-2 items-end mb-2">
                {/* 2nd place — left */}
                <div className="tr-card p-4 text-center flex flex-col items-center">
                  <Avatar
                    name={top2 ? `${top2.firstName} ${top2.lastName}` : ''}
                    photoUrl={top2?.photoUrl}
                    size="md"
                  />
                  <span className="text-[#9A9692] text-sm mt-2">🥈 2</span>
                  <p className="text-sm font-bold truncate w-full text-center text-[#F5F5F5] mt-0.5">
                    {top2 ? top2.firstName : '—'}
                  </p>
                  <p className="text-xs text-[#FFC400]">{top2?.totalPoints ?? 0} б.</p>
                </div>

                {/* 1st place — center, taller, golden glow */}
                <div
                  className="tr-card p-4 text-center flex flex-col items-center scale-105"
                  style={{ boxShadow: '0 0 40px rgba(255,196,0,.22)', borderColor: 'rgba(255,210,63,.30)' }}
                >
                  <span className="text-xl mb-1">👑</span>
                  <Avatar
                    name={top1 ? `${top1.firstName} ${top1.lastName}` : ''}
                    photoUrl={top1?.photoUrl}
                    size="lg"
                  />
                  <span className="text-[#FFD23F] text-sm mt-2">🥇 1</span>
                  <p className="text-sm font-bold truncate w-full text-center text-[#F5F5F5] mt-0.5">
                    {top1 ? top1.firstName : '—'}
                  </p>
                  <p className="text-sm font-bold text-[#FFD23F]">{top1?.totalPoints ?? 0} б.</p>
                </div>

                {/* 3rd place — right */}
                <div className="tr-card p-4 text-center flex flex-col items-center">
                  <Avatar
                    name={top3 ? `${top3.firstName} ${top3.lastName}` : ''}
                    photoUrl={top3?.photoUrl}
                    size="sm"
                  />
                  <span className="text-[#9A9692] text-sm mt-2">🥉 3</span>
                  <p className="text-sm font-bold truncate w-full text-center text-[#F5F5F5] mt-0.5">
                    {top3 ? top3.firstName : '—'}
                  </p>
                  <p className="text-xs text-[#FFC400]">{top3?.totalPoints ?? 0} б.</p>
                </div>
              </div>
            )}

            {/* Rank 4+ list */}
            {rest.length > 0 && (
              <div className="tr-card overflow-hidden">
                {rest.map((child, idx) => {
                  const rank = idx + 4
                  return (
                    <div
                      key={child.id}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-[#1A120F] transition-colors ${idx < rest.length - 1 ? 'border-b border-[#34201A]' : ''}`}
                    >
                      <span className="w-6 text-center text-sm font-bold text-[#9A9692] shrink-0">{rank}</span>
                      <Avatar
                        name={`${child.firstName} ${child.lastName}`}
                        photoUrl={child.photoUrl}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#F5F5F5] truncate">{child.firstName} {child.lastName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <BeltBadge belt={child.currentBelt} size="sm" />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-[#FFC400]">{child.totalPoints}</p>
                        <p className="text-[10px] text-[#9A9692]">балів</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Single athlete case — no podium, just list */}
            {sorted.length === 1 && (
              <div className="tr-card overflow-hidden">
                {sorted.map((child, idx) => (
                  <div key={child.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-6 text-center text-sm font-bold text-[#FFD23F] shrink-0">1</span>
                    <Avatar name={`${child.firstName} ${child.lastName}`} photoUrl={child.photoUrl} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#F5F5F5] truncate">{child.firstName} {child.lastName}</p>
                      <BeltBadge belt={child.currentBelt} size="sm" />
                    </div>
                    <p className="font-bold text-[#FFC400]">{child.totalPoints} б.</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )
      ) : (
        // Parent view
        myChild ? (
          <div className="space-y-4">
            {myChildRank !== null && myChildRank > 0 && (
              <div className="tr-card-glow p-5">
                <p className="text-sm text-[#9A9692] mb-1">Місце в рейтингу</p>
                <p className="text-4xl font-display font-black text-[#FFC400]">#{myChildRank}</p>
              </div>
            )}
            <div className="tr-card p-4">
              <div className="flex items-center gap-3">
                <Avatar name={`${myChild.firstName} ${myChild.lastName}`} photoUrl={myChild.photoUrl} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#F5F5F5] truncate">{myChild.firstName} {myChild.lastName}</p>
                  <div className="mt-1">
                    <BeltBadge belt={myChild.currentBelt} showName />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-[#FFC400]">{myChild.totalPoints}</p>
                  <p className="text-xs text-[#9A9692]">балів</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#9A9692] text-center">Загальний рейтинг доступний тільки тренеру</p>
          </div>
        ) : (
          <p className="text-sm text-[#9A9692]">Спортсмена не знайдено</p>
        )
      )}
    </div>
  )
}
