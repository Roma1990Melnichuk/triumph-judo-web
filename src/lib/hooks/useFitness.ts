'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, addDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface FitnessExercise {
  id: string
  name: string
  unit: string
  isDefault: boolean
}

export interface FitnessAssignment {
  id: string
  coachId: string
  title: string
  exerciseId: string
  exerciseName: string
  exerciseUnit: string
  targetValue: number
  startDate: Date
  deadline: Date
  assignedChildIds: string[]
  status: 'active' | 'draft' | 'completed'
  coachComment: string
  isCumulative: boolean
}

export interface FitnessLog {
  id: string
  childId: string
  exerciseId: string
  exerciseName: string
  exerciseUnit: string
  date: Date
  value: number
  comment: string
  difficulty: 1 | 2 | 3
  assignmentId?: string
}

export interface FitnessGoal {
  id: string
  childId: string
  exerciseId: string
  exerciseName: string
  exerciseUnit: string
  targetValue: number
  deadline: Date
  isAchieved: boolean
}

// ── Converters ────────────────────────────────────────────────────────────────

function exerciseFromFirestore(id: string, d: Record<string, unknown>): FitnessExercise {
  return {
    id,
    name: (d.name as string) ?? '',
    unit: (d.unit as string) ?? 'рази',
    isDefault: (d.isDefault as boolean) ?? false,
  }
}

function assignmentFromFirestore(id: string, d: Record<string, unknown>): FitnessAssignment {
  return {
    id,
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
  }
}

function logFromFirestore(id: string, d: Record<string, unknown>): FitnessLog {
  return {
    id,
    childId: (d.childId as string) ?? '',
    exerciseId: (d.exerciseId as string) ?? '',
    exerciseName: (d.exerciseName as string) ?? '',
    exerciseUnit: (d.exerciseUnit as string) ?? 'рази',
    date: (d.date as Timestamp)?.toDate() ?? new Date(),
    value: (d.value as number) ?? 0,
    comment: (d.comment as string) ?? '',
    difficulty: (d.difficulty as 1 | 2 | 3) ?? 1,
    assignmentId: d.assignmentId as string | undefined,
  }
}

function goalFromFirestore(id: string, d: Record<string, unknown>): FitnessGoal {
  return {
    id,
    childId: (d.childId as string) ?? '',
    exerciseId: (d.exerciseId as string) ?? '',
    exerciseName: (d.exerciseName as string) ?? '',
    exerciseUnit: (d.exerciseUnit as string) ?? 'рази',
    targetValue: (d.targetValue as number) ?? 0,
    deadline: (d.deadline as Timestamp)?.toDate() ?? new Date(),
    isAchieved: (d.isAchieved as boolean) ?? false,
  }
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useFitnessExercises() {
  const [exercises, setExercises] = useState<FitnessExercise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'fitness_exercises'))
    const unsub = onSnapshot(q, (snap) => {
      setExercises(snap.docs.map(d => exerciseFromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [])

  return { exercises, loading }
}

export function useFitnessAssignments(coachId?: string) {
  const [assignments, setAssignments] = useState<FitnessAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coachId) { setLoading(false); return }
    const q = query(
      collection(db, 'fitness_assignments'),
      where('coachId', '==', coachId),
      orderBy('deadline', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setAssignments(snap.docs.map(d => assignmentFromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [coachId])

  return { assignments, loading }
}

export function useChildFitnessAssignments(childId?: string) {
  const [assignments, setAssignments] = useState<FitnessAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    const q = query(
      collection(db, 'fitness_assignments'),
      where('assignedChildIds', 'array-contains', childId),
      where('status', '==', 'active')
    )
    const unsub = onSnapshot(q, (snap) => {
      setAssignments(snap.docs.map(d => assignmentFromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [childId])

  return { assignments, loading }
}

export function useFitnessLogs(childId?: string) {
  const [logs, setLogs] = useState<FitnessLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    const q = query(
      collection(db, 'fitness_logs'),
      where('childId', '==', childId),
      orderBy('date', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => logFromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [childId])

  return { logs, loading }
}

export function useFitnessGoals(childId?: string) {
  const [goals, setGoals] = useState<FitnessGoal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    const q = query(
      collection(db, 'fitness_goals'),
      where('childId', '==', childId)
    )
    const unsub = onSnapshot(q, (snap) => {
      setGoals(snap.docs.map(d => goalFromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [childId])

  return { goals, loading }
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function saveAssignment(
  data: Omit<FitnessAssignment, 'id'> & { id?: string }
): Promise<string> {
  const id = data.id ?? crypto.randomUUID()
  await setDoc(doc(db, 'fitness_assignments', id), {
    coachId: data.coachId,
    title: data.title,
    exerciseId: data.exerciseId,
    exerciseName: data.exerciseName,
    exerciseUnit: data.exerciseUnit,
    targetValue: data.targetValue,
    startDate: data.startDate,
    deadline: data.deadline,
    assignedChildIds: data.assignedChildIds,
    status: data.status,
    coachComment: data.coachComment,
    isCumulative: data.isCumulative,
    updatedAt: serverTimestamp(),
  }, { merge: true })
  return id
}

export async function saveLog(data: Omit<FitnessLog, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'fitness_logs'), {
    childId: data.childId,
    exerciseId: data.exerciseId,
    exerciseName: data.exerciseName,
    exerciseUnit: data.exerciseUnit,
    date: data.date,
    value: data.value,
    comment: data.comment,
    difficulty: data.difficulty,
    ...(data.assignmentId ? { assignmentId: data.assignmentId } : {}),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function deleteAssignment(id: string): Promise<void> {
  await deleteDoc(doc(db, 'fitness_assignments', id))
}

export async function deleteLog(id: string): Promise<void> {
  await deleteDoc(doc(db, 'fitness_logs', id))
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getAssignmentProgress(
  logs: FitnessLog[],
  assignment: FitnessAssignment,
  childId: string
): number {
  const relevant = logs.filter(l => l.assignmentId === assignment.id && l.childId === childId)
  if (!relevant.length) return 0
  const value = assignment.isCumulative
    ? relevant.reduce((sum, l) => sum + l.value, 0)
    : Math.max(...relevant.map(l => l.value))
  return Math.min(100, (value / assignment.targetValue) * 100)
}
