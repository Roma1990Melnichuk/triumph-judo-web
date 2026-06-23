'use client'
import { Target, ArrowLeft, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useChallenges, useChallengeProgress } from '@/lib/hooks/useChallenges'

function daysLeft(endDate: Date): number {
  return Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000))
}

export default function ChallengesPage() {
  const { userModel } = useAuth()
  const childId = userModel?.childIds?.[0]
  const { challenges, loading } = useChallenges(childId)
  const { progress } = useChallengeProgress(childId)

  const individual = challenges.filter(c => c.type === 'individual')
  const team = challenges.filter(c => c.type === 'team')

  function ChallengeCard({ ch }: { ch: typeof challenges[0] }) {
    const prog = progress.find(p => p.challengeId === ch.id)
    const pct = prog ? Math.min(100, Math.round((prog.currentValue / ch.targetValue) * 100)) : 0
    const days = daysLeft(ch.endDate)
    const isCompleted = prog?.completed ?? false

    return (
      <div className={`rounded-[18px] p-4 flex gap-3 transition-all ${isCompleted ? 'opacity-70' : ''}`}
           style={{ background: '#100C0A', border: `1px solid ${isCompleted ? '#2A4020' : '#2A1810'}` }}>
        <span className="text-2xl shrink-0">{ch.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-semibold ${isCompleted ? 'text-[#4CAF50]' : 'text-white'}`}>{ch.title}</p>
            <span className="text-xs font-black text-[#FFD21A] shrink-0">+{ch.xpReward} XP</span>
          </div>
          <p className="text-[12px] text-white/40 mt-0.5">{ch.description}</p>

          <div className="mt-2.5">
            <div className="flex justify-between text-[11px] text-white/35 mb-1">
              <span>{prog?.currentValue ?? 0} / {ch.targetValue}</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[.07] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                   style={{ width: `${pct}%`, background: isCompleted ? '#4CAF50' : '#FF6A00' }} />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2 text-[11px] text-white/30">
            {isCompleted ? (
              <span className="text-[#4CAF50] font-semibold">✓ Виконано</span>
            ) : (
              <span className="flex items-center gap-1"><Clock size={10} /> {days} дн. залишилось</span>
            )}
            {ch.type === 'team' && (
              <span className="flex items-center gap-1"><Users size={10} /> Командний</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/loyalty" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <Target size={18} className="text-[#FF6A00]" />
        <h1 className="text-xl font-display font-black text-white">Виклики</h1>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-[18px] bg-[#100C0A] animate-pulse" />)}
        </div>
      ) : challenges.length === 0 ? (
        <div className="rounded-[24px] p-10 text-center" style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
          <Target size={32} className="mx-auto mb-2 text-white/20" />
          <p className="text-white/40 text-sm">Активних викликів немає</p>
          <p className="text-white/25 text-xs mt-1">Тренер додасть нові виклики</p>
        </div>
      ) : (
        <>
          {individual.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 px-1">Особисті</h2>
              {individual.map(ch => <ChallengeCard key={ch.id} ch={ch} />)}
            </section>
          )}
          {team.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 px-1">Командні</h2>
              {team.map(ch => <ChallengeCard key={ch.id} ch={ch} />)}
            </section>
          )}
        </>
      )}
    </div>
  )
}
