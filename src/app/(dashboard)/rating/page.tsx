'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useChildren, useChildById } from '@/lib/hooks/useChildren'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { BeltBadge } from '@/components/ui/belt-badge'
import { Card, CardContent } from '@/components/ui/card'
import { BELT_DISPLAY } from '@/lib/constants'
import { Trophy, Crown, Medal } from 'lucide-react'

const RANK_STYLE: Record<number, string> = {
  1: 'bg-[#FFD21A]/10 border-[#FFD21A]/30',
  2: 'bg-[#B7B0A8]/10 border-[#B7B0A8]/30',
  3: 'bg-[#FF8A00]/10 border-[#FF8A00]/30',
}

const RANK_NUM_STYLE: Record<number, string> = {
  1: 'text-[#FFD21A]',
  2: 'text-[#B7B0A8]',
  3: 'text-[#FF8A00]',
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={16} className="text-[#FFD21A]" />
  if (rank === 2) return <Medal size={16} className="text-[#B7B0A8]" />
  if (rank === 3) return <Medal size={16} className="text-[#FF8A00]" />
  return null
}

export default function RatingPage() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'
  const { children, loading } = useChildren(isCoach ? userModel?.uid : undefined)
  const { child: myChild, loading: childLoading } = useChildById(!isCoach ? userModel?.childIds?.[0] : undefined)

  const sorted = [...children].sort((a, b) => b.totalPoints - a.totalPoints)
  const myChildRank = myChild ? sorted.findIndex(c => c.id === myChild.id) + 1 : null

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <Trophy size={20} className="text-[#FFD21A]" />
        <h1 className="text-lg font-bold text-[#F7F5F2]">Рейтинг</h1>
      </div>

      {loading || childLoading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => <div key={i} className="h-14 rounded-2xl bg-[#120605] animate-pulse" />)}
        </div>
      ) : isCoach ? (
        <>
          {sorted.length === 0 ? (
            <p className="text-sm text-[#746E68]">Спортсменів поки немає</p>
          ) : (
            <div className="space-y-2">
              {sorted.map((child, idx) => {
                const rank = idx + 1
                const rowStyle = RANK_STYLE[rank] ?? 'bg-[#120605] border-[#2A1410]'
                const numStyle = RANK_NUM_STYLE[rank] ?? 'text-[#746E68]'
                return (
                  <div key={child.id} className={`flex items-center gap-3 p-3 rounded-2xl border ${rowStyle} transition-colors`}>
                    <div className={`w-7 text-center font-bold text-sm ${numStyle}`}>
                      {rank <= 3 ? <RankIcon rank={rank} /> : <span>{rank}</span>}
                    </div>
                    <Avatar name={`${child.firstName} ${child.lastName}`} photoUrl={child.photoUrl} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#F7F5F2] truncate">{child.firstName} {child.lastName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <BeltBadge belt={child.currentBelt} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#FFD21A]">{child.totalPoints}</p>
                      <p className="text-[10px] text-[#746E68]">очок</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        // Parent view - show their child's info with rank
        myChild ? (
          <div className="space-y-4">
            {myChildRank !== null && myChildRank > 0 && (
              <div className="p-4 rounded-2xl bg-[#FFD21A]/10 border border-[#FFD21A]/30">
                <p className="text-sm text-[#B7B0A8] mb-1">Місце в рейтингу</p>
                <p className="text-4xl font-bold text-[#FFD21A]">#{myChildRank}</p>
              </div>
            )}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={`${myChild.firstName} ${myChild.lastName}`} photoUrl={myChild.photoUrl} size="lg" />
                  <div className="flex-1">
                    <p className="font-bold text-[#F7F5F2]">{myChild.firstName} {myChild.lastName}</p>
                    <BeltBadge belt={myChild.currentBelt} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#FFD21A]">{myChild.totalPoints}</p>
                    <p className="text-xs text-[#746E68]">очок</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <p className="text-sm text-[#746E68]">Загальний рейтинг доступний тільки тренеру</p>
          </div>
        ) : (
          <p className="text-sm text-[#746E68]">Спортсмена не знайдено</p>
        )
      )}
    </div>
  )
}
