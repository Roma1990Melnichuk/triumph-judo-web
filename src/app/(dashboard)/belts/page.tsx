'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useChildren, useChildrenByIds, useChildById } from '@/lib/hooks/useChildren'
import { useBeltRequirements, useBeltProgress, saveRequirement, getPassedCount } from '@/lib/hooks/useBelts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BeltBadge } from '@/components/ui/belt-badge'
import { BELT_LEVELS, BELT_DISPLAY, BELT_COLOR } from '@/lib/constants'
import { ChevronDown, ChevronRight, Plus, Trash2, Check, X as XIcon, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import type { BeltLevel, Exercise } from '@/lib/types'

function ParentBeltView() {
  const { userModel } = useAuth()
  const childId = userModel?.childIds?.[0]
  const { child, loading: childLoading } = useChildById(childId)
  const { requirements, loading: reqLoading } = useBeltRequirements()
  const { progress, loading: progressLoading } = useBeltProgress(childId, child?.currentBelt)

  if (childLoading || reqLoading || progressLoading) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-[#120605] animate-pulse" />)}</div>
  }
  if (!child) return <p className="text-sm text-[#746E68]">Спортсмена не знайдено</p>

  const req = requirements[child.currentBelt]
  const exercises = req?.exercises ?? []
  const passedCount = getPassedCount(progress)
  const total = exercises.length
  const pct = total > 0 ? Math.round((passedCount / total) * 100) : 0

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <BeltBadge belt={child.currentBelt} />
            <div>
              <p className="font-semibold text-[#F7F5F2]">{child.firstName} {child.lastName}</p>
              <p className="text-sm text-[#746E68]">{BELT_DISPLAY[child.currentBelt]}</p>
            </div>
            {child.beltReady && <Badge variant="gold" className="ml-auto">Готовий до атестації</Badge>}
          </div>
          {total > 0 && (
            <>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[#B7B0A8]">Прогрес</span>
                <span className="text-[#FFD21A] font-semibold">{passedCount}/{total}</span>
              </div>
              <div className="h-2 rounded-full bg-[#1B0A08] overflow-hidden">
                <div className="h-full rounded-full bg-[#FFD21A] transition-all" style={{ width: `${pct}%` }} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {exercises.length === 0 ? (
        <p className="text-sm text-[#746E68]">Вправ для цього поясу не знайдено</p>
      ) : (
        <div className="space-y-2">
          {exercises.map(ex => {
            const passed = progress?.passed?.[ex.id] ?? false
            return (
              <div key={ex.id} className={`flex items-center gap-3 p-3 rounded-2xl border ${passed ? 'bg-[#63D728]/5 border-[#63D728]/20' : 'bg-[#120605] border-[#2A1410]'}`}>
                <div className={`size-6 rounded-full flex items-center justify-center shrink-0 ${passed ? 'bg-[#63D728]/20 text-[#63D728]' : 'bg-[#1B0A08] text-[#746E68]'}`}>
                  {passed ? <Check size={12} /> : <XIcon size={12} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F7F5F2]">{ex.name}</p>
                  {ex.description && <p className="text-xs text-[#746E68] truncate">{ex.description}</p>}
                </div>
                <Badge variant={passed ? 'success' : 'default'} className="text-[10px]">
                  {passed ? 'Здано' : 'Не здано'}
                </Badge>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CoachBeltView() {
  const { userModel } = useAuth()
  const { children } = useChildren(userModel?.uid)
  const { requirements, loading } = useBeltRequirements()
  const [expanded, setExpanded] = useState<BeltLevel | null>(null)
  const [editingBelt, setEditingBelt] = useState<BeltLevel | null>(null)
  const [newExercise, setNewExercise] = useState({ name: '', description: '' })
  const [savingReq, setSavingReq] = useState(false)

  const toggle = (belt: BeltLevel) => setExpanded(p => p === belt ? null : belt)

  const handleAddExercise = async (belt: BeltLevel) => {
    if (!newExercise.name.trim() || !userModel) return
    const req = requirements[belt]
    const exercises = req?.exercises ?? []
    const ex: Exercise = { id: crypto.randomUUID(), name: newExercise.name, description: newExercise.description, category: 'technique' }
    setSavingReq(true)
    try {
      await saveRequirement({ belt, exercises: [...exercises, ex], updatedAt: new Date(), updatedByCoachId: userModel.uid })
      toast.success('Вправу додано')
      setNewExercise({ name: '', description: '' })
    } catch {
      toast.error('Помилка')
    } finally {
      setSavingReq(false)
    }
  }

  const handleRemoveExercise = async (belt: BeltLevel, exerciseId: string) => {
    if (!userModel) return
    const req = requirements[belt]
    const exercises = (req?.exercises ?? []).filter(e => e.id !== exerciseId)
    try {
      await saveRequirement({ belt, exercises, updatedAt: new Date(), updatedByCoachId: userModel.uid })
      toast.success('Видалено')
    } catch {
      toast.error('Помилка')
    }
  }

  if (loading) return (
    <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-14 rounded-2xl bg-[#120605] animate-pulse" />)}</div>
  )

  return (
    <div className="space-y-2 max-w-2xl">
      {BELT_LEVELS.map(belt => {
        const req = requirements[belt]
        const exCount = req?.exercises?.length ?? 0
        const athletes = children.filter(c => c.currentBelt === belt)
        const readyCount = athletes.filter(c => c.beltReady).length
        const isOpen = expanded === belt
        const isEditing = editingBelt === belt

        return (
          <div key={belt} className="rounded-2xl bg-[#120605] border border-[#2A1410] overflow-hidden">
            <button onClick={() => toggle(belt)} className="w-full flex items-center gap-3 p-4 hover:bg-[#1B0A08] transition-colors">
              <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: BELT_COLOR[belt] }} />
              <span className="font-medium text-[#F7F5F2] flex-1 text-left">{BELT_DISPLAY[belt]}</span>
              <div className="flex items-center gap-2 mr-2">
                <Badge variant="default" className="text-[10px]">{athletes.length} спорт.</Badge>
                {readyCount > 0 && <Badge variant="gold" className="text-[10px]">{readyCount} готові</Badge>}
                <span className="text-xs text-[#746E68]">{exCount} вправ</span>
              </div>
              {isOpen ? <ChevronDown size={16} className="text-[#746E68]" /> : <ChevronRight size={16} className="text-[#746E68]" />}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-2 border-t border-[#2A1410] pt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[#B7B0A8]">Вправи для атестації</p>
                  <Button size="sm" variant="ghost" onClick={() => setEditingBelt(isEditing ? null : belt)}>
                    <Pencil size={12} className="mr-1" />{isEditing ? 'Готово' : 'Редагувати'}
                  </Button>
                </div>
                {(req?.exercises ?? []).map(ex => (
                  <div key={ex.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1B0A08]">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#F7F5F2]">{ex.name}</p>
                      {ex.description && <p className="text-xs text-[#746E68]">{ex.description}</p>}
                    </div>
                    {isEditing && (
                      <button onClick={() => handleRemoveExercise(belt, ex.id)} className="p-1 text-[#746E68] hover:text-[#FF3B30] transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
                {(req?.exercises ?? []).length === 0 && <p className="text-xs text-[#746E68]">Вправ не додано</p>}

                {isEditing && (
                  <div className="flex gap-2 pt-2">
                    <div className="flex-1 space-y-2">
                      <input value={newExercise.name} onChange={e => setNewExercise(f => ({ ...f, name: e.target.value }))} placeholder="Назва вправи..." className="w-full h-9 px-3 rounded-xl bg-[#2A1410] border border-[#2A1410] text-sm text-[#F7F5F2] placeholder-[#746E68] focus:outline-none focus:border-[#FFD21A]" />
                      <input value={newExercise.description} onChange={e => setNewExercise(f => ({ ...f, description: e.target.value }))} placeholder="Опис (необов'язково)..." className="w-full h-9 px-3 rounded-xl bg-[#2A1410] border border-[#2A1410] text-sm text-[#F7F5F2] placeholder-[#746E68] focus:outline-none focus:border-[#FFD21A]" />
                    </div>
                    <Button size="sm" loading={savingReq} onClick={() => handleAddExercise(belt)}><Plus size={13} /></Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function BeltsPage() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#F7F5F2]">{isCoach ? 'Пояси та вимоги' : 'Мій прогрес'}</h1>
      {isCoach ? <CoachBeltView /> : <ParentBeltView />}
    </div>
  )
}
