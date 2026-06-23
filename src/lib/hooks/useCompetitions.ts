'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import type { CompetitionResult } from '../types'

function fromFirestore(id: string, d: Record<string, unknown>): CompetitionResult {
  return {
    id,
    childId: (d.childId as string) ?? '',
    competitionName: (d.competitionName as string) ?? '',
    date: (d.date as Timestamp)?.toDate() ?? new Date(),
    place: (d.place as number) ?? 0,
    medal: (d.medal as CompetitionResult['medal']) ?? 'none',
    weight: (d.weight as string) ?? '',
    points: (d.points as number) ?? 0,
    coachId: (d.coachId as string) ?? '',
    notes: d.notes as string | undefined,
  }
}

export function useChildCompetitions(childId?: string) {
  const [results, setResults] = useState<CompetitionResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    const q = query(
      collection(db, 'competition_results'),
      where('childId', '==', childId),
      orderBy('date', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setResults(snap.docs.map(d => fromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [childId])

  return { results, loading }
}

export function useAllCompetitions(coachId?: string) {
  const [results, setResults] = useState<CompetitionResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coachId) { setLoading(false); return }
    const q = query(
      collection(db, 'competition_results'),
      where('coachId', '==', coachId),
      orderBy('date', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setResults(snap.docs.map(d => fromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [coachId])

  return { results, loading }
}

export async function saveCompetitionResult(result: Omit<CompetitionResult, 'id'> & { id?: string }): Promise<string> {
  const id = result.id ?? crypto.randomUUID()
  await setDoc(doc(db, 'competition_results', id), {
    childId: result.childId,
    competitionName: result.competitionName,
    date: result.date,
    place: result.place,
    medal: result.medal,
    weight: result.weight,
    points: result.points,
    coachId: result.coachId,
    notes: result.notes ?? '',
  }, { merge: true })
  return id
}

export async function deleteCompetitionResult(id: string) {
  await deleteDoc(doc(db, 'competition_results', id))
}
