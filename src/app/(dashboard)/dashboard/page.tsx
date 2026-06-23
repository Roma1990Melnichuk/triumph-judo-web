'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useChildren, useChildrenByIds } from '@/lib/hooks/useChildren'
import { useGroups } from '@/lib/hooks/useGroups'
import { BeltBadge } from '@/components/ui/belt-badge'
import { Avatar } from '@/components/ui/avatar'
import { BELT_LEVELS, BELT_DISPLAY, DAY_NAMES } from '@/lib/constants'
import { Users, Calendar, Award, Star, TrendingUp, AlertCircle, ChevronRight, Flame } from 'lucide-react'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Доброго ранку'
  if (h < 17) return 'Доброго дня'
  return 'Доброго вечора'
}

function CoachDashboard() {
  const { userModel } = useAuth()
  const { children, loading: childrenLoading } = useChildren(userModel?.uid)
  const { groups, loading: groupsLoading } = useGroups(userModel?.uid)

  const beltReady = children.filter(c => c.beltReady)
  const today = new Date()
  const todayDow = today.getDay() === 0 ? 7 : today.getDay()

  // Next upcoming group: today first, then by next day
  const todayGroups = groups.filter(g => g.daysOfWeek.includes(todayDow))
  const nextGroup = todayGroups.length > 0 ? todayGroups[0] : groups[0] ?? null

  const totalAchievements = beltReady.length

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-display font-black text-[#F5F5F5]">
          {getGreeting()}, Тренере! 👋
        </h1>
        <p className="text-sm text-[#9A9692] mt-0.5">{DAY_NAMES[todayDow - 1]}, {today.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}</p>
      </div>

      {/* Next training card */}
      <div className="tr-card-glow p-5">
        <div className="flex items-start gap-4">
          <div className="size-11 rounded-2xl bg-[#E30613]/15 flex items-center justify-center shrink-0">
            <Calendar size={20} className="text-[#E30613]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#9A9692] uppercase tracking-wide font-semibold mb-1">Наступне тренування</p>
            {groupsLoading ? (
              <div className="h-5 w-40 bg-[#1A120F] rounded animate-pulse" />
            ) : nextGroup ? (
              <>
                <p className="font-bold text-[#F5F5F5] truncate">{nextGroup.name}</p>
                <p className="text-sm text-[#9A9692] mt-0.5">
                  {nextGroup.timeStart} – {nextGroup.timeEnd}
                  <span className="mx-2">·</span>
                  <span className="flex-inline">{nextGroup.childIds.length} уч.</span>
                </p>
              </>
            ) : (
              <p className="text-sm text-[#9A9692]">Тренувань не заплановано</p>
            )}
          </div>
          {nextGroup && (
            <Flame size={22} className="text-[#FF6A00] shrink-0 mt-0.5" />
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <Link href="/team">
          <div className="tr-card p-3 text-center hover:border-[#E30613]/30 transition-colors cursor-pointer">
            <p className="text-xl font-display font-black text-[#F5F5F5]">{childrenLoading ? '—' : children.length}</p>
            <p className="text-[11px] text-[#9A9692] mt-0.5">спортсменів</p>
          </div>
        </Link>
        <Link href="/belts">
          <div className="tr-card p-3 text-center hover:border-[#FFC400]/30 transition-colors cursor-pointer">
            <p className="text-xl font-display font-black text-[#FFC400]">{childrenLoading ? '—' : beltReady.length}</p>
            <p className="text-[11px] text-[#9A9692] mt-0.5">до поясу</p>
          </div>
        </Link>
        <Link href="/schedule">
          <div className="tr-card p-3 text-center hover:border-[#FF6A00]/30 transition-colors cursor-pointer">
            <p className="text-xl font-display font-black text-[#FF6A00]">{groupsLoading ? '—' : groups.length}</p>
            <p className="text-[11px] text-[#9A9692] mt-0.5">груп</p>
          </div>
        </Link>
      </div>

      {/* Recent athletes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-[#F5F5F5]">Спортсмени</h2>
          <Link href="/team" className="text-xs text-[#FF6A00] hover:text-[#FFC400] transition-colors">Всі →</Link>
        </div>

        {childrenLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-[24px] bg-[#12100F] animate-pulse" />
            ))}
          </div>
        ) : children.length === 0 ? (
          <div className="tr-card p-8 text-center">
            <Users size={32} className="mx-auto mb-3 text-[#9A9692]" />
            <p className="text-sm text-[#9A9692]">Немає спортсменів.{' '}
              <Link href="/team/add" className="text-[#E30613]">Додати</Link>
            </p>
          </div>
        ) : (
          <div className="tr-card overflow-hidden">
            {children.slice(0, 6).map((child, idx) => (
              <Link
                key={child.id}
                href={`/team/${child.id}`}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-[#1A120F] transition-colors ${idx < Math.min(children.length, 6) - 1 ? 'border-b border-[#34201A]' : ''}`}
              >
                <Avatar name={`${child.firstName} ${child.lastName}`} photoUrl={child.photoUrl} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#F5F5F5] truncate">{child.firstName} {child.lastName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <BeltBadge belt={child.currentBelt} size="sm" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#FFC400]">{child.totalPoints} б.</span>
                  <ChevronRight size={14} className="text-[#9A9692]" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ParentDashboard() {
  const { userModel } = useAuth()
  const { children, loading } = useChildrenByIds(userModel?.childIds ?? [])
  const child = children[0]

  // All hooks called before early returns
  const beltIdx = child ? BELT_LEVELS.indexOf(child.currentBelt) : -1
  const nextBelt = beltIdx >= 0 && beltIdx < BELT_LEVELS.length - 1 ? BELT_LEVELS[beltIdx + 1] : null

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-[24px] bg-[#12100F] animate-pulse" />
        ))}
      </div>
    )
  }

  if (!child) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle size={48} className="text-[#9A9692] mb-4" />
        <p className="text-[#9A9692]">Дитину ще не прив&apos;язано до акаунту.</p>
        <p className="text-sm text-[#9A9692] mt-1">Зверніться до тренера.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Greeting */}
      <h1 className="text-2xl font-display font-black text-[#F5F5F5]">
        {getGreeting()}! 👋
      </h1>

      {/* Child hero card */}
      <div className="tr-card-glow p-5">
        <div className="flex items-center gap-4">
          <Avatar name={`${child.firstName} ${child.lastName}`} photoUrl={child.photoUrl} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-[#F5F5F5] truncate">{child.firstName} {child.lastName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <BeltBadge belt={child.currentBelt} showName />
              {child.beltReady && (
                <span className="text-[10px] bg-[#FFC400]/10 text-[#FFC400] px-2 py-0.5 rounded-full font-medium">
                  Готовий до іспиту
                </span>
              )}
            </div>
            <p className="text-sm text-[#9A9692] mt-1">{child.totalPoints} балів · {child.weightCategory}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="tr-card p-4">
          <Star size={16} className="text-[#FFC400] mb-2" />
          <p className="text-2xl font-bold text-[#F5F5F5]">{child.totalPoints}</p>
          <p className="text-xs text-[#9A9692] mt-0.5">Загальні бали</p>
        </div>
        <div className="tr-card p-4">
          <TrendingUp size={16} className="text-[#FF6A00] mb-2" />
          <p className="text-2xl font-bold text-[#F5F5F5]">{child.bonusPoints}</p>
          <p className="text-xs text-[#9A9692] mt-0.5">Бонусні бали</p>
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/belts"
          className="tr-card p-4 hover:border-[#E30613]/40 transition-colors">
          <Award size={20} className="text-[#FFC400] mb-2" />
          <p className="text-sm font-medium text-[#F5F5F5]">Прогрес поясу</p>
          {nextBelt && <p className="text-xs text-[#9A9692] mt-0.5">Наступний: {BELT_DISPLAY[nextBelt]}</p>}
        </Link>
        <Link href="/achievements"
          className="tr-card p-4 hover:border-[#E30613]/40 transition-colors">
          <Star size={20} className="text-[#FFC400] mb-2" />
          <p className="text-sm font-medium text-[#F5F5F5]">Нагороди</p>
          <p className="text-xs text-[#9A9692] mt-0.5">Переглянути всі</p>
        </Link>
        <Link href="/nutrition"
          className="tr-card p-4 hover:border-[#E30613]/40 transition-colors">
          <TrendingUp size={20} className="text-[#E30613] mb-2" />
          <p className="text-sm font-medium text-[#F5F5F5]">Харчування</p>
          <p className="text-xs text-[#9A9692] mt-0.5">Лог за сьогодні</p>
        </Link>
        <Link href="/competitions"
          className="tr-card p-4 hover:border-[#E30613]/40 transition-colors">
          <Users size={20} className="text-[#E30613] mb-2" />
          <p className="text-sm font-medium text-[#F5F5F5]">Змагання</p>
          <p className="text-xs text-[#9A9692] mt-0.5">Результати</p>
        </Link>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { userModel } = useAuth()
  if (!userModel) return null
  return userModel.role === 'coach' ? <CoachDashboard /> : <ParentDashboard />
}
