'use client'
import Link from 'next/link'
import { Flame, History, Gift, Target, ChevronRight, TrendingUp } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useChildById } from '@/lib/hooks/useChildren'
import { useXPHistory } from '@/lib/hooks/useXP'
import { useChallenges, useChallengeProgress } from '@/lib/hooks/useChallenges'
import { getLoyaltyLevel, getLoyaltyProgress, LOYALTY_LEVELS, XP_SOURCE_ICON, XP_SOURCE_LABEL } from '@/lib/constants'

function LevelBadge({ xp }: { xp: number }) {
  const { level, pct, next } = getLoyaltyProgress(xp)
  const def = LOYALTY_LEVELS[level]
  return (
    <div className="rounded-[24px] p-6 flex flex-col gap-5"
         style={{ background: 'linear-gradient(135deg, #1A1000 0%, #100C0A 100%)', border: `1px solid ${def.color}40` }}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
             style={{ background: `${def.color}22`, border: `2px solid ${def.color}55` }}>
          {def.emoji}
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest" style={{ color: def.color }}>Triumph Points</p>
          <h2 className="text-2xl font-display font-black text-white">{xp.toLocaleString('uk')} XP</h2>
          <p className="text-sm font-bold mt-0.5" style={{ color: def.color }}>{def.label}</p>
        </div>
      </div>

      {next !== null && (
        <div>
          <div className="flex justify-between text-xs mb-1.5" style={{ color: def.color }}>
            <span>Прогрес до {LOYALTY_LEVELS[level === 'bronze' ? 'silver' : level === 'silver' ? 'gold' : 'champion'].label}</span>
            <span className="font-bold">{pct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/[.07] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
                 style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${def.color}, #FFC400)` }} />
          </div>
          <p className="text-[11px] text-white/35 mt-1">{next.toLocaleString('uk')} XP для наступного рівня</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 pt-1 border-t border-white/[.06]">
        {[
          { label: 'Рівень', value: def.label },
          { label: 'XP балів', value: xp.toLocaleString('uk') },
          { label: 'Прогрес', value: `${pct}%` },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className="text-base font-black text-white">{s.value}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuickActions() {
  const links = [
    { href: '/loyalty/history',    icon: History, label: 'Історія XP',   color: '#29B6F6' },
    { href: '/loyalty/rewards',    icon: Gift,    label: 'Каталог',      color: '#FFD21A' },
    { href: '/loyalty/challenges', icon: Target,  label: 'Виклики',      color: '#FF6A00' },
  ]
  return (
    <div className="grid grid-cols-3 gap-3">
      {links.map(l => {
        const Icon = l.icon
        return (
          <Link key={l.href} href={l.href}
                className="rounded-[18px] p-4 flex flex-col items-center gap-2 text-center hover:scale-[1.02] transition-transform"
                style={{ background: '#100C0A', border: `1px solid ${l.color}30` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: `${l.color}18` }}>
              <Icon size={18} style={{ color: l.color }} />
            </div>
            <span className="text-xs font-semibold text-white/75">{l.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

export default function LoyaltyPage() {
  const { userModel } = useAuth()
  const childId = userModel?.childIds?.[0]
  const { child, loading } = useChildById(childId)
  const { transactions } = useXPHistory(childId, 5)
  const { challenges } = useChallenges(childId)
  const { progress } = useChallengeProgress(childId)
  const isCoach = userModel?.role === 'coach'

  if (isCoach) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-display font-black text-white flex items-center gap-2">
            <Flame size={20} className="text-[#FF6A00]" /> Triumph Points
          </h1>
          <Link href="/loyalty/coach"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#FF3D00]/20 hover:bg-[#FF3D00]/30 transition-colors">
            Кабінет тренера <ChevronRight size={14} />
          </Link>
        </div>
        <div className="rounded-[24px] p-8 text-center" style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
          <Flame size={40} className="mx-auto mb-3 text-[#FF6A00]" />
          <p className="text-white font-semibold text-lg">Управляйте системою нагород</p>
          <p className="text-white/45 text-sm mt-1 mb-4">Нараховуйте XP спортсменам, створюйте виклики та нагороди</p>
          <Link href="/loyalty/coach"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-black"
                style={{ background: '#FFD21A' }}>
            Відкрити кабінет тренера
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="h-64 rounded-[24px] bg-[#100C0A] animate-pulse" />
  }

  const xp = child?.totalPoints ?? 0

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <Flame size={20} className="text-[#FF6A00]" />
        <h1 className="text-xl font-display font-black text-white">Triumph Points</h1>
      </div>

      <LevelBadge xp={xp} />
      <QuickActions />

      {/* Active challenges preview */}
      {challenges.length > 0 && (
        <div className="rounded-[24px] p-5 flex flex-col gap-3"
             style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={15} className="text-[#FF6A00]" />
              <span className="font-display font-black text-white text-sm uppercase tracking-wide">Активні виклики</span>
            </div>
            <Link href="/loyalty/challenges" className="text-[#FF6A00] text-xs font-semibold flex items-center gap-1 hover:text-[#FFC400]">
              ВСІ <ChevronRight size={12} />
            </Link>
          </div>
          {challenges.slice(0, 3).map(ch => {
            const prog = progress.find(p => p.challengeId === ch.id)
            const pct = prog ? Math.min(100, Math.round((prog.currentValue / ch.targetValue) * 100)) : 0
            return (
              <div key={ch.id} className="flex items-center gap-3 p-3 rounded-[14px] bg-[#1A120F]">
                <span className="text-2xl">{ch.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{ch.title}</p>
                  <div className="h-1.5 mt-1 rounded-full bg-white/[.07] overflow-hidden">
                    <div className="h-full rounded-full bg-[#FF6A00] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="text-xs font-bold text-[#FFD21A] shrink-0">+{ch.xpReward} XP</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Recent XP history */}
      {transactions.length > 0 && (
        <div className="rounded-[24px] p-5 flex flex-col gap-3"
             style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-[#FF6A00]" />
              <span className="font-display font-black text-white text-sm uppercase tracking-wide">Остання активність</span>
            </div>
            <Link href="/loyalty/history" className="text-[#FF6A00] text-xs font-semibold flex items-center gap-1 hover:text-[#FFC400]">
              ВСЯ ІСТОРІЯ <ChevronRight size={12} />
            </Link>
          </div>
          {transactions.slice(0, 5).map(tx => (
            <div key={tx.id} className="flex items-center gap-3 py-1.5">
              <span className="text-xl shrink-0">{XP_SOURCE_ICON[tx.source]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{tx.description}</p>
                <p className="text-[11px] text-white/35">{XP_SOURCE_LABEL[tx.source]}</p>
              </div>
              <span className={`text-sm font-bold shrink-0 ${tx.amount > 0 ? 'text-[#4CAF50]' : 'text-[#FF5252]'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount} XP
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
