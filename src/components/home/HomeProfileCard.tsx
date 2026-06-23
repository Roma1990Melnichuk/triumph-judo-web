'use client'
import Link from 'next/link'
import { Award, ExternalLink } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useChildById } from '@/lib/hooks/useChildren'
import { useChildAchievements } from '@/lib/hooks/useAchievements'
import { Avatar } from '@/components/ui/avatar'
import { BeltBadge } from '@/components/ui/belt-badge'
import { BELT_DISPLAY, BELT_COLOR } from '@/lib/constants'
import type { ChildModel } from '@/lib/types'

function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const r = 52, cx = 60, cy = 60
  const circumference = 2 * Math.PI * r
  const filled = (pct / 100) * circumference
  return (
    <svg width={120} height={120} className="rotate-[-90deg]">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1A120F" strokeWidth={8} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - filled}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset .6s ease', filter: `drop-shadow(0 0 6px ${color}88)` }} />
    </svg>
  )
}

function ChildCard({ child, earned }: { child: ChildModel; earned: number }) {
  const beltColor = BELT_COLOR[child.currentBelt] ?? '#E30613'
  const beltName = BELT_DISPLAY[child.currentBelt] ?? child.currentBelt
  const pct = Math.min(100, Math.round((child.totalPoints % 1000) / 10))
  return (
    <div className="rounded-[24px] flex flex-col overflow-hidden h-full"
         style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
      {/* Top gradient bar */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${beltColor}, #FFC40088)` }} />

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Name + belt */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[#9A9692] text-xs uppercase tracking-widest font-semibold mb-1">Атлет</p>
            <h2 className="font-display font-black text-[#F5F5F5] text-2xl leading-tight uppercase">
              {child.firstName}<br />{child.lastName}
            </h2>
          </div>
          <BeltBadge belt={child.currentBelt} />
        </div>

        {/* Photo + ring */}
        <div className="flex items-center justify-center gap-4">
          <div className="relative">
            <ProgressRing pct={pct} color={beltColor} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-black text-[#F5F5F5] text-xl">{pct}%</span>
              <span className="text-[#9A9692] text-[9px] uppercase tracking-wider mt-0.5">прогрес</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar name={`${child.firstName} ${child.lastName}`} photoUrl={child.photoUrl} size="lg" />
            <span className="text-xs font-semibold text-[#9A9692]">{beltName} пояс</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Рік', value: child.birthYear },
            { label: 'Вага', value: child.weightCategory },
            { label: 'Очки', value: child.totalPoints },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-[12px] bg-black/30 border border-[#2A1810] p-2.5 text-center">
              <p className="text-[#F5F5F5] font-bold text-sm">{value}</p>
              <p className="text-[#9A9692] text-[10px]">{label}</p>
            </div>
          ))}
        </div>

        {/* Achievements count */}
        {earned > 0 && (
          <div className="flex items-center gap-2 bg-[#FFC400]/10 rounded-[12px] px-3 py-2 border border-[#FFC400]/20">
            <Award size={14} className="text-[#FFC400]" />
            <span className="text-[#FFC400] text-xs font-semibold">{earned} досягнень здобуто</span>
          </div>
        )}

        {/* Link */}
        <Link href="/team" className="mt-auto flex items-center justify-center gap-1.5 text-xs font-semibold text-[#FF6A00] hover:text-[#FFC400] transition-colors">
          Відкрити профіль <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  )
}

export function HomeProfileCard() {
  const { userModel } = useAuth()
  const childId = userModel?.childIds?.[0]
  const { child, loading } = useChildById(childId)
  const { earned } = useChildAchievements(child?.id)

  if (loading) {
    return <div className="rounded-[24px] bg-[#100C0A] animate-pulse min-h-[340px]" />
  }

  if (!child) {
    // Coach: show their own info
    return (
      <div className="rounded-[24px] flex flex-col justify-center items-center gap-4 p-6 min-h-[340px]"
           style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
        <Avatar name={userModel?.name ?? ''} photoUrl={userModel?.photoUrl} size="xl" />
        <div className="text-center">
          <p className="text-[#9A9692] text-xs uppercase tracking-widest mb-1">Тренер</p>
          <h2 className="font-display font-black text-[#F5F5F5] text-xl uppercase">{userModel?.name}</h2>
        </div>
        <Link href="/team" className="text-xs font-semibold text-[#FF6A00] hover:text-[#FFC400] transition-colors flex items-center gap-1">
          Команда <ExternalLink size={12} />
        </Link>
      </div>
    )
  }

  return <ChildCard child={child} earned={earned.length} />
}
