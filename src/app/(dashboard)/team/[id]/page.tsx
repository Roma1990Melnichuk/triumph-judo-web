'use client'

import { useState } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useChildById, saveChild, updateChildBelt } from '@/lib/hooks/useChildren'
import { useGroups, addChildToGroup, removeChildFromGroup } from '@/lib/hooks/useGroups'
import { useChildAchievements } from '@/lib/hooks/useAchievements'
import { useChildCompetitions } from '@/lib/hooks/useCompetitions'
import { useBeltRequirements, useBeltProgress, toggleExercise, getPassedCount } from '@/lib/hooks/useBelts'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { BeltBadge } from '@/components/ui/belt-badge'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BELT_LEVELS, BELT_DISPLAY, ACHIEVEMENT_DEFS } from '@/lib/constants'
import { ArrowLeft, Award, Star, Trophy, Dumbbell, Edit, CheckCircle, Circle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { BeltLevel } from '@/lib/types'

type Tab = 'overview' | 'belts' | 'achievements' | 'competitions'

function BeltTab({ childId, currentBelt }: { childId: string; currentBelt: BeltLevel }) {
  const { userModel } = useAuth()
  const { requirements } = useBeltRequirements()
  const req = requirements[currentBelt]
  const { progress } = useBeltProgress(childId, currentBelt)
  const isCoach = userModel?.role === 'coach'

  if (!req) return <p className="text-sm text-[#746E68]">Вимоги не налаштовано</p>

  const passed = getPassedCount(progress)
  const total = req.exercises.length
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0

  const handleToggle = async (exerciseId: string, current: boolean) => {
    if (!isCoach || !userModel) return
    try {
      await toggleExercise(childId, currentBelt, exerciseId, !current, userModel.uid)
    } catch {
      toast.error('Помилка')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-[#B7B0A8]">Прогрес: {passed}/{total}</span>
          <span className="text-sm font-bold text-[#FFD21A]">{pct}%</span>
        </div>
        <Progress value={pct} />
      </div>
      <div className="space-y-2">
        {req.exercises.map(ex => {
          const done = progress?.passed[ex.id] ?? false
          return (
            <button
              key={ex.id}
              onClick={() => handleToggle(ex.id, done)}
              disabled={!isCoach}
              className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#1B0A08] hover:bg-[#2A1410] transition-colors text-left disabled:cursor-default"
            >
              {done
                ? <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                : <Circle size={16} className="text-[#746E68] shrink-0 mt-0.5" />
              }
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${done ? 'text-[#B7B0A8] line-through' : 'text-[#F7F5F2]'}`}>{ex.name}</p>
                {ex.description && <p className="text-xs text-[#746E68] mt-0.5">{ex.description}</p>}
              </div>
              <span className="text-[10px] text-[#746E68] bg-[#120605] px-1.5 py-0.5 rounded-full capitalize shrink-0">{ex.category}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function AthleteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { userModel } = useAuth()
  const router = useRouter()
  const { child, loading } = useChildById(id)
  const { groups } = useGroups(userModel?.role === 'coach' ? userModel?.uid : undefined)
  const { earned } = useChildAchievements(id)
  const { results } = useChildCompetitions(id)
  const [tab, setTab] = useState<Tab>('overview')
  const isCoach = userModel?.role === 'coach'

  if (loading) return <div className="h-40 rounded-2xl bg-[#120605] animate-pulse" />
  if (!child) return <p className="text-[#746E68]">Спортсмена не знайдено</p>

  const childGroups = groups.filter(g => g.childIds.includes(id))
  const medals = { gold: 0, silver: 0, bronze: 0 }
  results.forEach(r => { if (r.medal === 'gold') medals.gold++; else if (r.medal === 'silver') medals.silver++; else if (r.medal === 'bronze') medals.bronze++ })

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Огляд', icon: Star },
    { key: 'belts', label: 'Пояс', icon: Award },
    { key: 'achievements', label: 'Нагороди', icon: Star },
    { key: 'competitions', label: 'Змагання', icon: Trophy },
  ]

  return (
    <div className="max-w-2xl space-y-4">
      <Link href="/team" className="flex items-center gap-1.5 text-sm text-[#746E68] hover:text-[#F7F5F2] transition-colors">
        <ArrowLeft size={14} /> Команда
      </Link>

      {/* Profile card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <Avatar name={`${child.firstName} ${child.lastName}`} photoUrl={child.photoUrl} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className="text-lg font-bold text-[#F7F5F2]">{child.firstName} {child.lastName}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <BeltBadge belt={child.currentBelt} />
                    {child.beltReady && <Badge variant="gold">Готовий</Badge>}
                  </div>
                </div>
                {isCoach && (
                  <Link href={`/team/${id}/edit`}>
                    <Button variant="ghost" size="sm"><Edit size={14} /></Button>
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3 text-center">
                <div>
                  <p className="text-sm font-bold text-[#F7F5F2]">{child.totalPoints}</p>
                  <p className="text-[10px] text-[#746E68]">балів</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#F7F5F2]">{earned.length}</p>
                  <p className="text-[10px] text-[#746E68]">нагород</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#F7F5F2]">{results.length}</p>
                  <p className="text-[10px] text-[#746E68]">змагань</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#120605] rounded-2xl p-1 border border-[#2A1410]">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 h-8 text-xs font-medium rounded-xl transition-all ${tab === t.key ? 'bg-[#D50000] text-white' : 'text-[#746E68] hover:text-[#F7F5F2]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <Row label="Рік народження" value={String(child.birthYear)} />
              <Row label="Стать" value={child.gender === 'male' ? 'Чоловіча' : 'Жіноча'} />
              <Row label="Вага" value={child.weightCategory} />
              <Row label="Бонусні бали" value={String(child.bonusPoints)} />
              {child.phone && <Row label="Телефон" value={child.phone} />}
              {childGroups.length > 0 && <Row label="Групи" value={childGroups.map(g => g.name).join(', ')} />}
            </CardContent>
          </Card>
          {results.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-bold text-[#F7F5F2] mb-3">Медалі</p>
                <div className="flex gap-4">
                  {medals.gold > 0 && <div className="text-center"><p className="text-xl">🥇</p><p className="text-sm font-bold text-[#F7F5F2]">{medals.gold}</p></div>}
                  {medals.silver > 0 && <div className="text-center"><p className="text-xl">🥈</p><p className="text-sm font-bold text-[#F7F5F2]">{medals.silver}</p></div>}
                  {medals.bronze > 0 && <div className="text-center"><p className="text-xl">🥉</p><p className="text-sm font-bold text-[#F7F5F2]">{medals.bronze}</p></div>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === 'belts' && <BeltTab childId={id} currentBelt={child.currentBelt} />}

      {tab === 'achievements' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {earned.length === 0
            ? <p className="col-span-full text-sm text-[#746E68]">Нагород поки немає</p>
            : earned.map(a => {
                const def = ACHIEVEMENT_DEFS.find(d => d.id === a.achievementId)
                if (!def) return null
                return (
                  <div key={a.achievementId} className="p-3 rounded-2xl bg-[#120605] border border-[#2A1410] text-center">
                    <p className="text-2xl">{def.emoji}</p>
                    <p className="text-xs font-medium text-[#F7F5F2] mt-1 leading-tight">{def.name}</p>
                    <p className="text-[10px] text-[#746E68] mt-0.5">{formatDate(a.earnedAt)}</p>
                  </div>
                )
              })
          }
        </div>
      )}

      {tab === 'competitions' && (
        <div className="space-y-2">
          {results.length === 0
            ? <p className="text-sm text-[#746E68]">Змагань поки немає</p>
            : results.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#120605] border border-[#2A1410]">
                  <span className="text-xl">{r.medal === 'gold' ? '🥇' : r.medal === 'silver' ? '🥈' : r.medal === 'bronze' ? '🥉' : '🏅'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F7F5F2] truncate">{r.competitionName}</p>
                    <p className="text-xs text-[#746E68]">{formatDate(r.date)} · {r.place} місце · +{r.points} б.</p>
                  </div>
                </div>
              ))
          }
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-[#746E68]">{label}</span>
      <span className="text-[#F7F5F2] font-medium">{value}</span>
    </div>
  )
}
