'use client'
import { useState } from 'react'
import { Flame, Users, ArrowLeft, TrendingUp, Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useChildren } from '@/lib/hooks/useChildren'
import { useChallenges } from '@/lib/hooks/useChallenges'
import { useLoyaltyRewards } from '@/lib/hooks/useLoyaltyRewards'
import { adjustXP } from '@/lib/hooks/useXP'
import { getLoyaltyLevel, getLoyaltyProgress, LOYALTY_LEVELS } from '@/lib/constants'
import { Avatar } from '@/components/ui/avatar'
import type { ChildModel } from '@/lib/types'

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-[18px] p-4 flex flex-col gap-1"
         style={{ background: '#100C0A', border: `1px solid ${color}25` }}>
      <p className="text-2xl font-black text-white">{typeof value === 'number' ? value.toLocaleString('uk') : value}</p>
      <p className="text-[11px] uppercase tracking-wider" style={{ color }}>{label}</p>
    </div>
  )
}

function AdjustXPModal({ child, coachId, onClose }: { child: ChildModel; coachId: string; onClose: () => void }) {
  const [delta, setDelta] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit() {
    const n = parseInt(delta, 10)
    if (isNaN(n) || n === 0 || !reason.trim()) return
    setSaving(true)
    try {
      await adjustXP({ childId: child.id, delta: n, coachId, reason })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-sm rounded-[24px] p-6 space-y-4"
           style={{ background: '#140E0A', border: '1px solid #3A2010' }}>
        <h3 className="text-base font-display font-black text-white">
          Коригування XP — {child.firstName} {child.lastName}
        </h3>
        <p className="text-sm text-white/45">Поточний баланс: <strong className="text-[#FFD21A]">{child.totalPoints} XP</strong></p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Значення (+ нарахування, − списання)</label>
            <input type="number" value={delta} onChange={e => setDelta(e.target.value)} placeholder="+50 або -100"
                   className="w-full rounded-xl bg-[#1A120F] border border-white/[.1] px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6A00]" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Причина</label>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Наприклад: Особливі досягнення"
                   className="w-full rounded-xl bg-[#1A120F] border border-white/[.1] px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6A00]" />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-white/50 hover:text-white bg-white/[.05] transition-colors">
            Скасувати
          </button>
          <button onClick={submit} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black transition-all disabled:opacity-50"
                  style={{ background: '#FFD21A' }}>
            {saving ? '...' : 'Підтвердити'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CoachLoyaltyPage() {
  const { userModel } = useAuth()
  const uid = userModel?.uid ?? ''
  const { children, loading } = useChildren(uid)
  const { challenges } = useChallenges()
  const { rewards } = useLoyaltyRewards()
  const [adjustChild, setAdjustChild] = useState<ChildModel | null>(null)

  const sorted = [...children].sort((a, b) => b.totalPoints - a.totalPoints)
  const totalXP = children.reduce((sum, c) => sum + c.totalPoints, 0)
  const levelCounts = { bronze: 0, silver: 0, gold: 0, champion: 0 }
  children.forEach(c => { levelCounts[getLoyaltyLevel(c.totalPoints)]++ })

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/loyalty" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <Flame size={18} className="text-[#FF6A00]" />
        <h1 className="text-xl font-display font-black text-white">Кабінет тренера — Triumph Points</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Всього XP" value={totalXP} color="#FFD21A" />
        <StatCard label="Спортсменів" value={children.length} color="#29B6F6" />
        <StatCard label="Бронза" value={levelCounts.bronze} color="#CD7F32" />
        <StatCard label="Срібло" value={levelCounts.silver} color="#A8B4C0" />
        <StatCard label="Золото" value={levelCounts.gold} color="#FFD21A" />
        <StatCard label="Чемпіон" value={levelCounts.champion} color="#FF3B30" />
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/loyalty/challenges"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FF6A00]/20 hover:bg-[#FF6A00]/30 transition-colors">
          <Plus size={14} /> Новий виклик
        </Link>
        <Link href="/loyalty/rewards"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FFD21A]/10 hover:bg-[#FFD21A]/20 transition-colors">
          <Plus size={14} /> Нова нагорода
        </Link>
      </div>

      {/* Active summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[18px] p-4" style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
          <p className="text-xs text-white/40 uppercase tracking-wider">Активні виклики</p>
          <p className="text-3xl font-black text-white mt-1">{challenges.length}</p>
          <Link href="/loyalty/challenges" className="text-xs text-[#FF6A00] hover:text-[#FFC400] flex items-center gap-1 mt-2">
            Переглянути <ChevronRight size={12} />
          </Link>
        </div>
        <div className="rounded-[18px] p-4" style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
          <p className="text-xs text-white/40 uppercase tracking-wider">Нагород у каталозі</p>
          <p className="text-3xl font-black text-white mt-1">{rewards.length}</p>
          <Link href="/loyalty/rewards" className="text-xs text-[#FFD21A] hover:text-[#FFC400] flex items-center gap-1 mt-2">
            Переглянути <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Athletes table */}
      <div className="rounded-[24px] overflow-hidden" style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
        <div className="flex items-center gap-2 p-4 border-b border-white/[.06]">
          <Users size={15} className="text-[#FF6A00]" />
          <span className="font-display font-black text-white text-sm uppercase tracking-wide">Рейтинг XP</span>
        </div>

        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-[#1A120F] animate-pulse" />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-8 text-center text-white/30 text-sm">Спортсменів немає</div>
        ) : (
          <div className="divide-y divide-white/[.04]">
            {sorted.map((child, idx) => {
              const { level, pct } = getLoyaltyProgress(child.totalPoints)
              const levelDef = LOYALTY_LEVELS[level]
              return (
                <div key={child.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[.02] transition-colors">
                  <span className="text-sm font-bold text-white/25 w-6 text-right shrink-0">#{idx + 1}</span>
                  <Avatar name={`${child.firstName} ${child.lastName}`} photoUrl={child.photoUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{child.lastName} {child.firstName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="h-1 flex-1 rounded-full bg-white/[.07] overflow-hidden max-w-[80px]">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: levelDef.color }} />
                      </div>
                      <span className="text-[10px]" style={{ color: levelDef.color }}>{levelDef.emoji} {levelDef.label}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-[#FFD21A]">{child.totalPoints.toLocaleString('uk')}</p>
                    <p className="text-[10px] text-white/30">XP</p>
                  </div>
                  <button
                    onClick={() => setAdjustChild(child)}
                    className="ml-2 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-white/60 bg-white/[.05] hover:bg-[#FF6A00]/20 hover:text-[#FF6A00] transition-colors shrink-0">
                    Змінити
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {adjustChild && userModel && (
        <AdjustXPModal child={adjustChild} coachId={userModel.uid} onClose={() => setAdjustChild(null)} />
      )}
    </div>
  )
}
