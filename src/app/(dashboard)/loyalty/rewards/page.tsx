'use client'
import { useState } from 'react'
import { Gift, ArrowLeft, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth-context'
import { useChildById } from '@/lib/hooks/useChildren'
import { useLoyaltyRewards, useRewardOrders, redeemReward } from '@/lib/hooks/useLoyaltyRewards'
import { REWARD_CATEGORY_LABEL, LOYALTY_LEVELS, getLoyaltyLevel } from '@/lib/constants'
import type { RewardCategory } from '@/lib/types'

const LEVEL_ORDER: Record<string, number> = { bronze: 0, silver: 1, gold: 2, champion: 3 }

export default function RewardsPage() {
  const { userModel } = useAuth()
  const childId = userModel?.childIds?.[0]
  const { child } = useChildById(childId)
  const { rewards, loading } = useLoyaltyRewards()
  const { orders } = useRewardOrders(childId)
  const [activeCategory, setActiveCategory] = useState<RewardCategory | 'all'>('all')
  const [redeeming, setRedeeming] = useState<string | null>(null)

  const xp = child?.totalPoints ?? 0
  const level = getLoyaltyLevel(xp)
  const levelRank = LEVEL_ORDER[level]

  const categories: (RewardCategory | 'all')[] = ['all', 'merch', 'services', 'masterclass', 'tournament', 'bonus']
  const filtered = activeCategory === 'all' ? rewards : rewards.filter(r => r.category === activeCategory)

  const pendingIds = new Set(orders.filter(o => o.status === 'pending' || o.status === 'approved').map(o => o.rewardId))

  async function handleRedeem(reward: typeof rewards[0]) {
    if (!childId || redeeming) return
    if (xp < reward.xpCost) return
    if (LEVEL_ORDER[reward.minLevel] > levelRank) return
    setRedeeming(reward.id)
    try {
      await redeemReward(childId, reward)
    } finally {
      setRedeeming(null)
    }
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/loyalty" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <Gift size={18} className="text-[#FFD21A]" />
        <h1 className="text-xl font-display font-black text-white">Каталог нагород</h1>
        {child && (
          <span className="ml-auto text-sm font-bold text-[#FFD21A]">{xp.toLocaleString('uk')} XP</span>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    activeCategory === cat
                      ? 'bg-[#FFD21A] text-black'
                      : 'bg-[#1A120F] text-white/50 hover:text-white/80'
                  }`}>
            {cat === 'all' ? 'Всі' : REWARD_CATEGORY_LABEL[cat]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-56 rounded-[20px] bg-[#100C0A] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[24px] p-10 text-center" style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
          <Gift size={32} className="mx-auto mb-2 text-white/20" />
          <p className="text-white/40 text-sm">Немає нагород у цій категорії</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(reward => {
            const canAfford = xp >= reward.xpCost
            const levelOk = LEVEL_ORDER[reward.minLevel] <= levelRank
            const canRedeem = canAfford && levelOk
            const isPending = pendingIds.has(reward.id)
            const levelDef = LOYALTY_LEVELS[reward.minLevel]

            return (
              <div key={reward.id}
                   className={`rounded-[20px] flex flex-col overflow-hidden transition-all ${!canRedeem ? 'opacity-65' : 'hover:scale-[1.01]'}`}
                   style={{ background: '#100C0A', border: `1px solid ${canRedeem ? '#3A2820' : '#2A1810'}` }}>
                {/* Image */}
                <div className="relative h-36 bg-[#1A120F]">
                  {reward.imageUrl ? (
                    <Image src={reward.imageUrl} alt={reward.name} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">🎁</div>
                  )}
                  {!levelOk && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-1.5">
                      <Lock size={14} className="text-white/60" />
                      <span className="text-xs text-white/60">{levelDef.label}+</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold"
                       style={{ background: `${levelDef.color}30`, color: levelDef.color, border: `1px solid ${levelDef.color}50` }}>
                    {levelDef.emoji} {levelDef.label}
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div>
                    <p className="font-semibold text-white text-sm">{reward.name}</p>
                    <p className="text-[12px] text-white/45 mt-0.5 line-clamp-2">{reward.description}</p>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-base font-black text-[#FFD21A]">{reward.xpCost.toLocaleString('uk')} XP</span>
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canRedeem || isPending || redeeming === reward.id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isPending
                          ? 'bg-[#FF6A00]/20 text-[#FF6A00]'
                          : canRedeem
                            ? 'bg-[#FFD21A] text-black hover:bg-[#FFC400]'
                            : 'bg-white/[.07] text-white/30 cursor-not-allowed'
                      }`}>
                      {redeeming === reward.id ? '...' : isPending ? 'Очікує' : 'Отримати'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
