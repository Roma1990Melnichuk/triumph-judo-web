'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { collection, query, where, onSnapshot, doc, getDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { useChildren } from '@/lib/hooks/useChildren'
import {
  useFitnessLogs,
  saveLog,
  getAssignmentProgress,
  type FitnessAssignment,
  type FitnessLog,
} from '@/lib/hooks/useFitness'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CalendarClock, Target, MessageSquare, Plus, Flame, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

// ── Difficulty label ──────────────────────────────────────────────────────────

const DIFFICULTY_LABEL: Record<1 | 2 | 3, string> = {
  1: '😌 Легко',
  2: '😤 Середньо',
  3: '😰 Важко',
}

const DIFFICULTY_COLOR: Record<1 | 2 | 3, string> = {
  1: 'text-[#29D158]',
  2: 'text-[#FFC400]',
  3: 'text-[#FF3B30]',
}

// ── Load assignment once ──────────────────────────────────────────────────────

function useAssignment(id: string) {
  const [assignment, setAssignment] = useState<FitnessAssignment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    getDoc(doc(db, 'fitness_assignments', id)).then(snap => {
      if (snap.exists()) {
        const d = snap.data() as Record<string, unknown>
        setAssignment({
          id: snap.id,
          coachId: (d.coachId as string) ?? '',
          title: (d.title as string) ?? '',
          exerciseId: (d.exerciseId as string) ?? '',
          exerciseName: (d.exerciseName as string) ?? '',
          exerciseUnit: (d.exerciseUnit as string) ?? 'рази',
          targetValue: (d.targetValue as number) ?? 0,
          startDate: (d.startDate as Timestamp)?.toDate() ?? new Date(),
          deadline: (d.deadline as Timestamp)?.toDate() ?? new Date(),
          assignedChildIds: (d.assignedChildIds as string[]) ?? [],
          status: (d.status as FitnessAssignment['status']) ?? 'active',
          coachComment: (d.coachComment as string) ?? '',
          isCumulative: (d.isCumulative as boolean) ?? false,
        })
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  return { assignment, loading }
}

// ── Logs for a specific assignment + child ────────────────────────────────────

function useAssignmentLogs(assignmentId: string, childId?: string) {
  const [logs, setLogs] = useState<FitnessLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!assignmentId || !childId) { setLoading(false); return }
    const q = query(
      collection(db, 'fitness_logs'),
      where('assignmentId', '==', assignmentId),
      where('childId', '==', childId)
    )
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => {
        const data = d.data() as Record<string, unknown>
        return {
          id: d.id,
          childId: (data.childId as string) ?? '',
          exerciseId: (data.exerciseId as string) ?? '',
          exerciseName: (data.exerciseName as string) ?? '',
          exerciseUnit: (data.exerciseUnit as string) ?? '',
          date: (data.date as Timestamp)?.toDate() ?? new Date(),
          value: (data.value as number) ?? 0,
          comment: (data.comment as string) ?? '',
          difficulty: (data.difficulty as 1 | 2 | 3) ?? 1,
          assignmentId: (data.assignmentId as string) ?? undefined,
        } satisfies FitnessLog
      })
      list.sort((a, b) => b.date.getTime() - a.date.getTime())
      setLogs(list)
      setLoading(false)
    })
    return unsub
  }, [assignmentId, childId])

  return { logs, loading }
}

// ── All logs for an assignment (coach view) ───────────────────────────────────

function useAllAssignmentLogs(assignmentId: string) {
  const [logs, setLogs] = useState<FitnessLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!assignmentId) { setLoading(false); return }
    const q = query(
      collection(db, 'fitness_logs'),
      where('assignmentId', '==', assignmentId)
    )
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => {
        const data = d.data() as Record<string, unknown>
        return {
          id: d.id,
          childId: (data.childId as string) ?? '',
          exerciseId: (data.exerciseId as string) ?? '',
          exerciseName: (data.exerciseName as string) ?? '',
          exerciseUnit: (data.exerciseUnit as string) ?? '',
          date: (data.date as Timestamp)?.toDate() ?? new Date(),
          value: (data.value as number) ?? 0,
          comment: (data.comment as string) ?? '',
          difficulty: (data.difficulty as 1 | 2 | 3) ?? 1,
          assignmentId: (data.assignmentId as string) ?? undefined,
        } satisfies FitnessLog
      }))
      setLoading(false)
    })
    return unsub
  }, [assignmentId])

  return { logs, loading }
}

// ── Log result dialog ─────────────────────────────────────────────────────────

interface LogFormProps {
  assignment: FitnessAssignment
  childId: string
  onClose: () => void
}

function LogForm({ assignment, childId, onClose }: LogFormProps) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ value: '', difficulty: '2' as '1' | '2' | '3', comment: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.value) { toast.error('Введіть результат'); return }
    setSaving(true)
    try {
      await saveLog({
        childId,
        exerciseId: assignment.exerciseId,
        exerciseName: assignment.exerciseName,
        exerciseUnit: assignment.exerciseUnit,
        date: new Date(),
        value: Number(form.value),
        comment: form.comment.trim(),
        difficulty: Number(form.difficulty) as 1 | 2 | 3,
        assignmentId: assignment.id,
      })
      toast.success('Результат збережено')
      onClose()
    } catch {
      toast.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            label={`Результат (${assignment.exerciseUnit})`}
            type="number"
            min="0"
            step="0.01"
            value={form.value}
            onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
            placeholder="0"
            required
          />
        </div>
        <div className="h-10 px-3 flex items-center rounded-[14px] bg-white/[.06] border border-white/10 text-sm text-[#9A9692] shrink-0">
          {assignment.exerciseUnit}
        </div>
      </div>

      <Select
        label="Складність"
        value={form.difficulty}
        onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as '1' | '2' | '3' }))}
      >
        <option value="1">😌 Легко</option>
        <option value="2">😤 Середньо</option>
        <option value="3">😰 Важко</option>
      </Select>

      <Input
        label="Коментар (необов'язково)"
        value={form.comment}
        onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
        placeholder="Як пройшло тренування?"
      />

      <div className="flex gap-2 justify-end pt-1">
        <Button variant="ghost" type="button" onClick={onClose}>Скасувати</Button>
        <Button type="submit" loading={saving} className="tr-btn-brand">Зберегти</Button>
      </div>
    </form>
  )
}

// ── Coach: children progress section ─────────────────────────────────────────

interface ChildProgressRowProps {
  child: { id: string; firstName: string; lastName: string; photoUrl?: string }
  assignment: FitnessAssignment
  allLogs: FitnessLog[]
}

function ChildProgressRow({ child, assignment, allLogs }: ChildProgressRowProps) {
  const childLogs = allLogs.filter(l => l.childId === child.id)
  const pct = getAssignmentProgress(childLogs, assignment, child.id)
  const currentValue = assignment.isCumulative
    ? childLogs.reduce((s, l) => s + l.value, 0)
    : childLogs.length > 0 ? Math.max(...childLogs.map(l => l.value)) : 0

  return (
    <div className="flex items-center gap-3">
      <Avatar name={`${child.firstName} ${child.lastName}`} photoUrl={child.photoUrl} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-[#F5F5F5] font-medium truncate">{child.firstName} {child.lastName}</span>
          <span className="text-xs text-[#9A9692] shrink-0 ml-2">
            <span className="text-[#FFC400] font-semibold">{currentValue}</span> / {assignment.targetValue} {assignment.exerciseUnit}
          </span>
        </div>
        <Progress value={pct} size="sm" />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FitnessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params as unknown as Promise<{ id: string }>)
  const router = useRouter()
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'
  const childId = userModel?.childIds?.[0]

  const { assignment, loading: assignmentLoading } = useAssignment(id)
  const { logs: myLogs } = useAssignmentLogs(id, isCoach ? undefined : childId)
  const { logs: allLogs } = useAllAssignmentLogs(id)
  const { children } = useChildren(isCoach ? userModel?.uid : undefined)

  const [showLogDialog, setShowLogDialog] = useState(false)

  const pct = assignment && childId
    ? getAssignmentProgress(myLogs, assignment, childId)
    : 0

  // children who have at least one log for this assignment
  const childrenWithLogs = isCoach
    ? children.filter(c => allLogs.some(l => l.childId === c.id))
    : []

  if (assignmentLoading) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="h-8 w-32 rounded-xl bg-[#12100F] animate-pulse" />
        <div className="h-32 rounded-3xl bg-[#12100F] animate-pulse" />
        <div className="h-48 rounded-3xl bg-[#12100F] animate-pulse" />
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="space-y-5 max-w-2xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#9A9692] hover:text-[#F5F5F5] transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm">Назад</span>
        </button>
        <div className="tr-card p-8 text-center">
          <p className="text-[#9A9692]">Завдання не знайдено</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#9A9692] hover:text-[#F5F5F5] transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Назад</span>
      </button>

      {/* Assignment header card */}
      <div className="tr-card-glow p-5 rounded-3xl">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h1 className="font-display font-bold text-[#F5F5F5] text-base leading-snug mb-1">
              {assignment.title}
            </h1>
            <p className="text-sm text-[#9A9692]">{assignment.exerciseName}</p>
          </div>
          {assignment.status === 'active'
            ? <Badge variant="success">Активне</Badge>
            : assignment.status === 'draft'
            ? <Badge variant="warning">Чернетка</Badge>
            : <Badge variant="default">Завершено</Badge>
          }
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-[#080808]/60 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Target size={13} className="text-[#FF6A00]" />
              <span className="text-[11px] text-[#9A9692] uppercase tracking-wide font-semibold">Ціль</span>
            </div>
            <p className="font-display font-bold text-[#F5F5F5]">
              {assignment.targetValue}
              <span className="text-sm font-normal text-[#9A9692] ml-1">{assignment.exerciseUnit}</span>
            </p>
          </div>
          <div className="bg-[#080808]/60 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <CalendarClock size={13} className="text-[#FFC400]" />
              <span className="text-[11px] text-[#9A9692] uppercase tracking-wide font-semibold">Дедлайн</span>
            </div>
            <p className="text-sm font-semibold text-[#F5F5F5]">{formatDate(assignment.deadline)}</p>
          </div>
        </div>

        {assignment.isCumulative && (
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp size={13} className="text-[#9A9692]" />
            <span className="text-xs text-[#9A9692]">Кумулятивний — зараховується сума всіх результатів</span>
          </div>
        )}

        {assignment.coachComment && (
          <div className="flex gap-2 bg-[#080808]/60 rounded-2xl p-3">
            <MessageSquare size={14} className="text-[#E30613] shrink-0 mt-0.5" />
            <p className="text-sm text-[#9A9692] leading-relaxed">{assignment.coachComment}</p>
          </div>
        )}
      </div>

      {/* Parent/athlete: progress + log button */}
      {!isCoach && childId && (
        <div className="tr-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#F5F5F5]">Мій прогрес</span>
            <span className="text-sm text-[#9A9692]">
              <span className="text-[#FFC400] font-display font-bold">{Math.round(pct)}%</span>
            </span>
          </div>
          <Progress value={pct} />

          <button
            onClick={() => setShowLogDialog(true)}
            className="tr-btn-brand w-full h-11 mt-4 text-sm flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Додати результат
          </button>
        </div>
      )}

      {/* Coach: button to log for demonstration / testing */}
      {isCoach && (
        <button
          onClick={() => setShowLogDialog(true)}
          className="tr-btn-brand h-10 px-5 text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          Додати результат
        </button>
      )}

      {/* Coach: children progress overview */}
      {isCoach && (
        <div className="tr-card p-4">
          <h2 className="font-semibold text-[#F5F5F5] text-sm mb-4">Прогрес спортсменів</h2>
          {assignment.assignedChildIds.length === 0 ? (
            <p className="text-sm text-[#9A9692]">Спортсменів не призначено</p>
          ) : (
            <div className="space-y-4">
              {children
                .filter(c => assignment.assignedChildIds.includes(c.id))
                .map(child => (
                  <ChildProgressRow
                    key={child.id}
                    child={child}
                    assignment={assignment}
                    allLogs={allLogs}
                  />
                ))
              }
              {assignment.assignedChildIds.length > 0 && children.filter(c => assignment.assignedChildIds.includes(c.id)).length === 0 && (
                <p className="text-sm text-[#9A9692]">Дані завантажуються...</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Logs history */}
      <div>
        <h2 className="font-semibold text-[#F5F5F5] text-sm mb-3">
          {isCoach ? 'Всі результати' : 'Мої результати'}
        </h2>
        {(isCoach ? allLogs : myLogs).length === 0 ? (
          <div className="tr-card p-8 text-center">
            <Flame size={24} className="mx-auto mb-2 text-[#34201A]" />
            <p className="text-sm text-[#9A9692]">Результатів поки немає</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(isCoach ? allLogs : myLogs).map(log => {
              const diffKey = log.difficulty as 1 | 2 | 3
              // find child name if coach
              const logChild = isCoach ? children.find(c => c.id === log.childId) : null
              return (
                <div key={log.id} className="tr-card p-3.5 flex items-start gap-3">
                  <div className="size-9 rounded-xl bg-[#E30613]/10 flex items-center justify-center shrink-0">
                    <Flame size={16} className="text-[#E30613]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isCoach && logChild && (
                      <p className="text-xs text-[#9A9692] mb-0.5">{logChild.firstName} {logChild.lastName}</p>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-bold text-[#F5F5F5]">
                        {log.value}
                        <span className="text-xs font-normal text-[#9A9692] ml-1">{log.exerciseUnit}</span>
                      </span>
                      <span className={`text-xs font-medium ${DIFFICULTY_COLOR[diffKey]}`}>
                        {DIFFICULTY_LABEL[diffKey]}
                      </span>
                    </div>
                    <p className="text-xs text-[#9A9692] mt-0.5">{formatDate(log.date)}</p>
                    {log.comment && (
                      <p className="text-xs text-[#9A9692] mt-1 italic">{log.comment}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Log dialog */}
      {assignment && (
        <Dialog open={showLogDialog} onClose={() => setShowLogDialog(false)} title="Додати результат">
          <LogForm
            assignment={assignment}
            childId={isCoach ? (userModel?.uid ?? '') : (childId ?? '')}
            onClose={() => setShowLogDialog(false)}
          />
        </Dialog>
      )}
    </div>
  )
}
