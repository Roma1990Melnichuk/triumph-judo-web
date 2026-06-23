'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useChildren, useChildrenByIds } from '@/lib/hooks/useChildren'
import { useGroups } from '@/lib/hooks/useGroups'
import { Card, CardContent } from '@/components/ui/card'
import { BeltBadge } from '@/components/ui/belt-badge'
import { Avatar } from '@/components/ui/avatar'
import { BELT_LEVELS, BELT_DISPLAY, DAY_NAMES } from '@/lib/constants'
import { Users, Calendar, Award, Star, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react'

function CoachDashboard() {
  const { userModel } = useAuth()
  const { children } = useChildren(userModel?.uid)
  const { groups } = useGroups(userModel?.uid)

  const beltReady = children.filter(c => c.beltReady)
  const today = new Date()
  const todayDow = today.getDay() === 0 ? 7 : today.getDay()
  const todayGroups = groups.filter(g => g.daysOfWeek.includes(todayDow))

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Спортсменів" value={children.length} href="/team" />
        <StatCard icon={Calendar} label="Групи" value={groups.length} href="/schedule" />
        <StatCard icon={Award} label="Готові до поясу" value={beltReady.length} href="/belts" accent />
        <StatCard icon={Star} label="Тренувань сьогодні" value={todayGroups.length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-bold text-[#F7F5F2] mb-3 flex items-center gap-2">
              <Calendar size={14} className="text-[#D50000]" />
              Тренування сьогодні — {DAY_NAMES[todayDow - 1]}
            </h2>
            {todayGroups.length === 0 ? (
              <p className="text-sm text-[#746E68]">Тренувань сьогодні немає</p>
            ) : (
              <div className="space-y-2">
                {todayGroups.map(g => (
                  <Link key={g.id} href={`/schedule/${g.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#1B0A08] hover:bg-[#2A1410] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-[#F7F5F2]">{g.name}</p>
                      <p className="text-xs text-[#746E68]">{g.timeStart} – {g.timeEnd} · {g.childIds.length} уч.</p>
                    </div>
                    <ChevronRight size={14} className="text-[#746E68]" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-bold text-[#F7F5F2] mb-3 flex items-center gap-2">
              <Award size={14} className="text-[#FFD21A]" />
              Готові до іспиту
            </h2>
            {beltReady.length === 0 ? (
              <p className="text-sm text-[#746E68]">Поки ніхто не готовий</p>
            ) : (
              <div className="space-y-2">
                {beltReady.slice(0, 5).map(child => (
                  <Link key={child.id} href={`/team/${child.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#1B0A08] transition-colors">
                    <Avatar name={`${child.firstName} ${child.lastName}`} photoUrl={child.photoUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F7F5F2] truncate">{child.firstName} {child.lastName}</p>
                      <BeltBadge belt={child.currentBelt} />
                    </div>
                    <ChevronRight size={14} className="text-[#746E68]" />
                  </Link>
                ))}
                {beltReady.length > 5 && (
                  <Link href="/belts" className="block text-xs text-[#D50000] hover:text-[#FF3B30] px-2 pt-1">
                    Ще {beltReady.length - 5}...
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#F7F5F2]">Спортсмени</h2>
            <Link href="/team" className="text-xs text-[#D50000] hover:text-[#FF3B30]">Всі →</Link>
          </div>
          {children.length === 0 ? (
            <p className="text-sm text-[#746E68]">Немає спортсменів. <Link href="/team/add" className="text-[#D50000]">Додати</Link></p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {children.slice(0, 6).map(child => (
                <Link key={child.id} href={`/team/${child.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#1B0A08] transition-colors">
                  <Avatar name={`${child.firstName} ${child.lastName}`} photoUrl={child.photoUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F7F5F2] truncate">{child.firstName} {child.lastName}</p>
                    <p className="text-xs text-[#746E68]">{child.totalPoints} балів · {BELT_DISPLAY[child.currentBelt]}</p>
                  </div>
                  {child.beltReady && <span className="text-[10px] bg-[#FFD21A]/10 text-[#FFD21A] px-1.5 py-0.5 rounded-full font-medium">Готовий</span>}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ParentDashboard() {
  const { userModel } = useAuth()
  const { children } = useChildrenByIds(userModel?.childIds ?? [])
  const child = children[0]

  if (!child) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle size={48} className="text-[#746E68] mb-4" />
        <p className="text-[#B7B0A8]">Дитину ще не прив&apos;язано до акаунту.</p>
        <p className="text-sm text-[#746E68] mt-1">Зверніться до тренера.</p>
      </div>
    )
  }

  const beltIdx = BELT_LEVELS.indexOf(child.currentBelt)
  const nextBelt = beltIdx < BELT_LEVELS.length - 1 ? BELT_LEVELS[beltIdx + 1] : null

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <Avatar name={`${child.firstName} ${child.lastName}`} photoUrl={child.photoUrl} size="lg" />
            <div>
              <h2 className="text-lg font-bold text-[#F7F5F2]">{child.firstName} {child.lastName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <BeltBadge belt={child.currentBelt} />
                {child.beltReady && <span className="text-[10px] bg-[#FFD21A]/10 text-[#FFD21A] px-2 py-0.5 rounded-full font-medium">Готовий до іспиту</span>}
              </div>
              <p className="text-sm text-[#746E68] mt-1">{child.totalPoints} балів · {child.weightCategory} кг</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Star} label="Бали" value={child.totalPoints} href="/achievements" />
        <StatCard icon={TrendingUp} label="Бонуси" value={child.bonusPoints} accent />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/belts" className="p-4 rounded-2xl bg-[#120605] border border-[#2A1410] hover:border-[#D50000]/40 transition-colors">
          <Award size={20} className="text-[#FFD21A] mb-2" />
          <p className="text-sm font-medium text-[#F7F5F2]">Прогрес поясу</p>
          {nextBelt && <p className="text-xs text-[#746E68] mt-0.5">Наступний: {BELT_DISPLAY[nextBelt]}</p>}
        </Link>
        <Link href="/achievements" className="p-4 rounded-2xl bg-[#120605] border border-[#2A1410] hover:border-[#D50000]/40 transition-colors">
          <Star size={20} className="text-[#FFD21A] mb-2" />
          <p className="text-sm font-medium text-[#F7F5F2]">Нагороди</p>
          <p className="text-xs text-[#746E68] mt-0.5">Переглянути всі</p>
        </Link>
        <Link href="/nutrition" className="p-4 rounded-2xl bg-[#120605] border border-[#2A1410] hover:border-[#D50000]/40 transition-colors">
          <TrendingUp size={20} className="text-[#D50000] mb-2" />
          <p className="text-sm font-medium text-[#F7F5F2]">Харчування</p>
          <p className="text-xs text-[#746E68] mt-0.5">Лог за сьогодні</p>
        </Link>
        <Link href="/competitions" className="p-4 rounded-2xl bg-[#120605] border border-[#2A1410] hover:border-[#D50000]/40 transition-colors">
          <Users size={20} className="text-[#D50000] mb-2" />
          <p className="text-sm font-medium text-[#F7F5F2]">Змагання</p>
          <p className="text-xs text-[#746E68] mt-0.5">Результати</p>
        </Link>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, href, accent }: {
  icon: React.ElementType; label: string; value: number; href?: string; accent?: boolean
}) {
  const inner = (
    <div className={`p-4 rounded-2xl bg-[#120605] border transition-colors ${accent ? 'border-[#FFD21A]/20' : 'border-[#2A1410]'} ${href ? 'hover:border-[#D50000]/40 cursor-pointer' : ''}`}>
      <Icon size={16} className={accent ? 'text-[#FFD21A]' : 'text-[#D50000]'} />
      <p className="text-2xl font-bold text-[#F7F5F2] mt-2">{value}</p>
      <p className="text-xs text-[#746E68] mt-0.5">{label}</p>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

export default function DashboardPage() {
  const { userModel } = useAuth()
  if (!userModel) return null
  return userModel.role === 'coach' ? <CoachDashboard /> : <ParentDashboard />
}
