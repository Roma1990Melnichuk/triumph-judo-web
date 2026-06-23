'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useChildren } from '@/lib/hooks/useChildren'
import {
  useFitnessExercises,
  useFitnessAssignments,
  useChildFitnessAssignments,
  useFitnessGoals,
  useFitnessLogs,
  saveAssignment,
  getAssignmentProgress,
  type FitnessAssignment,
} from '@/lib/hooks/useFitness'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Dumbbell, Plus, CalendarClock, Target, Trophy, ChevronRight, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusBadge(status: FitnessAssignment['status']) {
  if (status === 'active')    return <Badge variant="success">Активне</Badge>
  if (status === 'draft')     return <Badge variant="warning">Чернетка</Badge>
  return <Badge variant="default">Завершено</Badge>
}

// ── Coach: Assignment Form ────────────────────────────────────────────────────

interface AssignmentFormProps {
  coachId: string
  onClose: () => void
}

function AssignmentForm({ coachId, onClose }: AssignmentFormProps) {
  const { exercises } = useFitnessExercises()
  const { children } = useChildren(coachId)

  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    exerciseId: '',
    targetValue: '',
    isCumulative: false,
    deadline: '',
    coachComment: '',
    status: 'active' as 'active' | 'draft',
    selectedChildIds: [] as string[],
  })

  const selectedExercise = exercises.find(e => e.id === form.exerciseId)

  const toggleChild = (id: string) => {
    setForm(f => ({
      ...f,
      selectedChildIds: f.selectedChildIds.includes(id)
        ? f.selectedChildIds.filter(c => c !== id)
        : [...f.selectedChildIds, id],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.exerciseId || !form.targetValue || !form.deadline) {
      toast.error("Заповніть усі обов'язкові поля")
      return
    }
    if (!form.selectedChildIds.length) {
      toast.error('Оберіть хоча б одного спортсмена')
      return
    }
    setSaving(true)
    try {
      await saveAssignment({
        coachId,
        title: form.title.trim(),
        exerciseId: form.exerciseId,
        exerciseName: selectedExercise?.name ?? '',
        exerciseUnit: selectedExercise?.unit ?? 'рази',
        targetValue: Number(form.targetValue),
        isCumulative: form.isCumulative,
        startDate: new Date(),
        deadline: new Date(form.deadline),
        assignedChildIds: form.selectedChildIds,
        status: form.status,
        coachComment: form.coachComment.trim(),
      })
      toast.success('Завдання створено')
      onClose()
    } catch {
      toast.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Назва завдання"
        value={form.title}
        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        placeholder="Наприклад: 100 підтягувань за тиждень"
        required
      />

      <Select
        label="Вправа"
        value={form.exerciseId}
        onChange={e => setForm(f => ({ ...f, exerciseId: e.target.value }))}
      >
        <option value="">Оберіть вправу...</option>
        {exercises.map(ex => (
          <option key={ex.id} value={ex.id}>{ex.name}</option>
        ))}
      </Select>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            label={`Ціль${selectedExercise ? ` (${selectedExercise.unit})` : ''}`}
            type="number"
            min="1"
            value={form.targetValue}
            onChange={e => setForm(f => ({ ...f, targetValue: e.target.value }))}
            placeholder="50"
            required
          />
        </div>
        {selectedExercise && (
          <div className="h-10 px-3 flex items-center rounded-[14px] bg-white/[.06] border border-white/10 text-sm text-[#9A9692] shrink-0">
            {selectedExercise.unit}
          </div>
        )}
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.isCumulative}
          onChange={e => setForm(f => ({ ...f, isCumulative: e.target.checked }))}
          className="w-4 h-4 rounded accent-[#E30613]"
        />
        <span className="text-sm text-[#F5F5F5]">Кумулятивний результат</span>
        <span className="text-xs text-[#9A9692]">(сума всіх спроб)</span>
      </label>

      <Input
        label="Дедлайн"
        type="date"
        value={form.deadline}
        onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
        required
      />

      <Input
        label="Коментар тренера"
        value={form.coachComment}
        onChange={e => setForm(f => ({ ...f, coachComment: e.target.value }))}
        placeholder="Поради або деталі..."
      />

      <Select
        label="Статус"
        value={form.status}
        onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'draft' }))}
      >
        <option value="active">Активне</option>
        <option value="draft">Чернетка</option>
      </Select>

      {/* Athlete selection */}
      <div>
        <p className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wide">
          Спортсмени
        </p>
        {children.length === 0 ? (
          <p className="text-sm text-[#9A9692]">Немає спортсменів</p>
        ) : (
          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {children.map(child => (
              <label key={child.id} className="flex items-center gap-2.5 cursor-pointer select-none p-2 rounded-xl hover:bg-white/[.04] transition-colors">
                <input
                  type="checkbox"
                  checked={form.selectedChildIds.includes(child.id)}
                  onChange={() => toggleChild(child.id)}
                  className="w-4 h-4 rounded accent-[#E30613]"
                />
                <span className="text-sm text-[#F5F5F5]">{child.firstName} {child.lastName}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <Button variant="ghost" type="button" onClick={onClose}>Скасувати</Button>
        <Button type="submit" loading={saving} className="tr-btn-brand">Зберегти</Button>
      </div>
    </form>
  )
}

// ── Coach View ────────────────────────────────────────────────────────────────

function CoachView({ coachId }: { coachId: string }) {
  const [tab, setTab] = useState<'assignments' | 'exercises'>('assignments')
  const [showDialog, setShowDialog] = useState(false)
  const { assignments, loading } = useFitnessAssignments(coachId)
  const { exercises, loading: exLoading } = useFitnessExercises()

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl bg-[#12100F] border border-[#34201A]">
        {(['assignments', 'exercises'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 h-9 rounded-xl text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-gradient-to-r from-[#E30613] via-[#FF6A00] to-[#FFC400] text-white shadow-[0_0_18px_rgba(255,106,0,.35)]'
                : 'text-[#9A9692] hover:text-[#F5F5F5]'
            }`}
          >
            {t === 'assignments' ? 'Завдання' : 'Вправи'}
          </button>
        ))}
      </div>

      {tab === 'assignments' && (
        <>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-3xl bg-[#12100F] animate-pulse" />
              ))}
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center tr-card">
              <div className="size-14 rounded-2xl bg-[#E30613]/10 flex items-center justify-center mb-4">
                <Target size={26} className="text-[#E30613]" />
              </div>
              <p className="font-semibold text-[#F5F5F5] mb-1">Жодного завдання</p>
              <p className="text-sm text-[#9A9692] mb-5">Створіть перше завдання для своїх спортсменів</p>
              <button
                onClick={() => setShowDialog(true)}
                className="tr-btn-brand h-10 px-5 text-sm"
              >
                Створити завдання
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map(a => (
                <div key={a.id} className="tr-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-xl bg-[#E30613]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Dumbbell size={18} className="text-[#E30613]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-semibold text-[#F5F5F5] text-sm leading-snug">{a.title}</span>
                        {statusBadge(a.status)}
                      </div>
                      <p className="text-xs text-[#9A9692] mb-2">{a.exerciseName}</p>
                      <div className="flex items-center gap-3 text-xs text-[#9A9692]">
                        <span className="flex items-center gap-1">
                          <Target size={11} className="text-[#FF6A00]" />
                          <span className="text-[#F5F5F5] font-medium">{a.targetValue}</span> {a.exerciseUnit}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarClock size={11} className="text-[#FFC400]" />
                          {formatDate(a.deadline)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'exercises' && (
        <div className="tr-card overflow-hidden">
          {exLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(6)].map((_, i) => <div key={i} className="h-10 rounded-xl bg-white/[.04] animate-pulse" />)}
            </div>
          ) : exercises.length === 0 ? (
            <div className="p-8 text-center">
              <Layers size={24} className="mx-auto mb-2 text-[#34201A]" />
              <p className="text-sm text-[#9A9692]">Вправ поки немає</p>
            </div>
          ) : (
            <div className="divide-y divide-[#34201A]">
              {exercises.map(ex => (
                <div key={ex.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-[#F5F5F5] font-medium">{ex.name}</span>
                  <Badge variant="default">{ex.unit}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Desktop button — hidden on mobile (FAB handles mobile) */}
      <button
        onClick={() => setShowDialog(true)}
        className="tr-btn-brand hidden lg:flex items-center gap-2 h-10 px-5 text-sm"
      >
        <Plus size={16} />
        Нове завдання
      </button>

      {/* FAB — mobile only */}
      <button
        onClick={() => setShowDialog(true)}
        className="tr-btn-brand fixed bottom-6 right-4 z-40 size-14 rounded-2xl flex items-center justify-center shadow-[0_0_32px_rgba(255,106,0,.45)] lg:hidden"
        aria-label="Нове завдання"
      >
        <Plus size={22} />
      </button>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Нове завдання">
        <AssignmentForm coachId={coachId} onClose={() => setShowDialog(false)} />
      </Dialog>
    </>
  )
}

// ── Parent View ───────────────────────────────────────────────────────────────

function ParentView({ childId }: { childId: string }) {
  const router = useRouter()
  const [tab, setTab] = useState<'assignments' | 'goals'>('assignments')
  const { assignments, loading } = useChildFitnessAssignments(childId)
  const { goals, loading: goalsLoading } = useFitnessGoals(childId)
  const { logs } = useFitnessLogs(childId)

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl bg-[#12100F] border border-[#34201A]">
        {(['assignments', 'goals'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 h-9 rounded-xl text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-gradient-to-r from-[#E30613] via-[#FF6A00] to-[#FFC400] text-white shadow-[0_0_18px_rgba(255,106,0,.35)]'
                : 'text-[#9A9692] hover:text-[#F5F5F5]'
            }`}
          >
            {t === 'assignments' ? 'Завдання' : 'Цілі'}
          </button>
        ))}
      </div>

      {tab === 'assignments' && (
        <>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 rounded-3xl bg-[#12100F] animate-pulse" />
              ))}
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center tr-card">
              <div className="size-14 rounded-2xl bg-[#E30613]/10 flex items-center justify-center mb-4">
                <Dumbbell size={26} className="text-[#E30613]" />
              </div>
              <p className="font-semibold text-[#F5F5F5] mb-1">Активних завдань немає</p>
              <p className="text-sm text-[#9A9692]">Тренер ще не призначив завдань</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map(a => {
                const pct = getAssignmentProgress(logs, a, childId)
                return (
                  <button
                    key={a.id}
                    onClick={() => router.push(`/fitness/${a.id}`)}
                    className="w-full text-left tr-card-glow p-4 rounded-3xl group transition-transform active:scale-[.98]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="font-semibold text-[#F5F5F5] text-sm leading-snug mb-0.5">{a.title}</p>
                        <p className="text-xs text-[#9A9692]">{a.exerciseName}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-[#9A9692]">до {formatDate(a.deadline)}</span>
                        <ChevronRight size={14} className="text-[#9A9692] group-hover:text-[#F5F5F5] transition-colors" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-[#9A9692]">
                        Прогрес: <span className="text-[#F5F5F5] font-semibold">{Math.round(pct)}%</span>
                      </span>
                      <span className="text-xs text-[#9A9692]">
                        Ціль: <span className="text-[#FFC400] font-semibold">{a.targetValue} {a.exerciseUnit}</span>
                      </span>
                    </div>
                    <Progress value={pct} size="sm" />
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'goals' && (
        <>
          {goalsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-3xl bg-[#12100F] animate-pulse" />
              ))}
            </div>
          ) : goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center tr-card">
              <div className="size-14 rounded-2xl bg-[#FFC400]/10 flex items-center justify-center mb-4">
                <Trophy size={26} className="text-[#FFC400]" />
              </div>
              <p className="font-semibold text-[#F5F5F5] mb-1">Цілей ще немає</p>
              <p className="text-sm text-[#9A9692]">Тренер додасть цілі для відстеження прогресу</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map(g => (
                <div key={g.id} className="tr-card p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-semibold text-[#F5F5F5] text-sm">{g.exerciseName}</p>
                      <p className="text-xs text-[#9A9692] mt-0.5">до {formatDate(g.deadline)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {g.isAchieved
                        ? <Badge variant="gold">Досягнуто</Badge>
                        : <Badge variant="default">В процесі</Badge>
                      }
                      <span className="text-xs text-[#9A9692]">
                        <span className="text-[#FFC400] font-semibold font-display">{g.targetValue}</span> {g.exerciseUnit}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FitnessPage() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'
  const childId = userModel?.childIds?.[0]

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-lg text-[#F5F5F5] tracking-tight">
            Фізична підготовка
          </h1>
          <p className="text-xs text-[#9A9692] mt-0.5">
            {isCoach ? 'Завдання та прогрес спортсменів' : 'Ваші завдання та цілі'}
          </p>
        </div>
      </div>

      {isCoach ? (
        <CoachView coachId={userModel!.uid} />
      ) : (
        <ParentView childId={childId ?? ''} />
      )}
    </div>
  )
}
