'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

// ── Training Sessions ─────────────────────────────────────────────────────────

export interface SessionDoc {
  id: string
  groupId: string
  coachId: string
  date: Date
  attendance: Record<string, boolean>
}

function sessionFromFirestore(id: string, d: Record<string, unknown>): SessionDoc {
  return {
    id,
    groupId: (d.groupId as string) ?? '',
    coachId: (d.coachId as string) ?? '',
    date: (d.date as Timestamp)?.toDate() ?? new Date(),
    attendance: (d.attendance as Record<string, boolean>) ?? {},
  }
}

/** Reads a single training_sessions doc for a given groupId + dateStr (e.g. "abc_2026-06-23"). Realtime. */
export function useGroupAttendance(groupId?: string, dateStr?: string) {
  const [session, setSession] = useState<SessionDoc | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!groupId || !dateStr) {
      setSession(null)
      setLoading(false)
      return
    }
    const docId = `${groupId}_${dateStr}`
    const unsub = onSnapshot(doc(db, 'training_sessions', docId), (snap) => {
      setSession(snap.exists() ? sessionFromFirestore(snap.id, snap.data() as Record<string, unknown>) : null)
      setLoading(false)
    })
    return unsub
  }, [groupId, dateStr])

  return { session, loading }
}

/** Saves (merge) an attendance document for the given group + date. */
export async function saveAttendance(
  groupId: string,
  coachId: string,
  date: Date,
  attendance: Record<string, boolean>
): Promise<void> {
  const dateStr = date.toISOString().split('T')[0]
  const docId = `${groupId}_${dateStr}`
  await setDoc(
    doc(db, 'training_sessions', docId),
    { id: docId, groupId, coachId, date, attendance },
    { merge: true }
  )
}

/** Returns last 30 sessions for a group, ordered by date desc. Realtime. */
export function useGroupAttendanceHistory(groupId?: string) {
  const [sessions, setSessions] = useState<SessionDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!groupId) {
      setSessions([])
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'training_sessions'),
      where('groupId', '==', groupId),
      orderBy('date', 'desc'),
      limit(30)
    )
    const unsub = onSnapshot(q, (snap) => {
      setSessions(snap.docs.map(d => sessionFromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [groupId])

  return { sessions, loading }
}

/**
 * Returns whether a child is present.
 * Default is present (true) when no session exists or child is not explicitly marked absent.
 */
export function isPresent(session: SessionDoc | null, childId: string): boolean {
  if (!session) return true
  return session.attendance[childId] !== false
}

// ── Honor Board ───────────────────────────────────────────────────────────────

export interface HonorBoardEntryDoc {
  id: string
  athleteId: string
  athleteName: string
  athleteAge?: number
  athleteBelt?: string
  type: string
  title: string
  description?: string
  competitionName?: string
  medalType?: 'gold' | 'silver' | 'bronze'
  imageUrl?: string
  coachComment?: string
  isPinned: boolean
  isVisible: boolean
  publishedAt: Date
}

function honorFromFirestore(id: string, d: Record<string, unknown>): HonorBoardEntryDoc {
  return {
    id,
    athleteId: (d.athleteId as string) ?? '',
    athleteName: (d.athleteName as string) ?? '',
    athleteAge: d.athleteAge as number | undefined,
    athleteBelt: d.athleteBelt as string | undefined,
    type: (d.type as string) ?? 'special',
    title: (d.title as string) ?? '',
    description: d.description as string | undefined,
    competitionName: d.competitionName as string | undefined,
    medalType: d.medalType as HonorBoardEntryDoc['medalType'],
    imageUrl: d.imageUrl as string | undefined,
    coachComment: d.coachComment as string | undefined,
    isPinned: (d.isPinned as boolean) ?? false,
    isVisible: (d.isVisible as boolean) ?? true,
    publishedAt: (d.publishedAt as Timestamp)?.toDate() ?? new Date(),
  }
}

/** Realtime list of visible honor board entries: pinned first, then newest. */
export function useHonorBoard() {
  const [entries, setEntries] = useState<HonorBoardEntryDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'club_honor_board'),
      where('isVisible', '==', true),
      orderBy('isPinned', 'desc'),
      orderBy('publishedAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setEntries(snap.docs.map(d => honorFromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [])

  return { entries, loading }
}

/** Adds a new honor board entry. Returns the new document ID. */
export async function saveHonorEntry(data: Omit<HonorBoardEntryDoc, 'id'>): Promise<string> {
  const { publishedAt, ...rest } = data
  const ref = await addDoc(collection(db, 'club_honor_board'), {
    ...rest,
    publishedAt: serverTimestamp(),
  })
  return ref.id
}

/** Deletes an honor board entry by ID. */
export async function deleteHonorEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, 'club_honor_board', id))
}
