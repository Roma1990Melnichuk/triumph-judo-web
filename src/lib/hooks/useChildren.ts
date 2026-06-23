'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import type { ChildModel } from '../types'
import { BELT_LEVELS } from '../constants'

function fromFirestore(id: string, d: Record<string, unknown>): ChildModel {
  return {
    id,
    firstName: (d.firstName as string) ?? '',
    lastName: (d.lastName as string) ?? '',
    birthYear: (d.birthYear as number) ?? 2010,
    weightCategory: (d.weightCategory as string) ?? '-30 кг',
    currentBelt: (d.currentBelt as ChildModel['currentBelt']) ?? 'white',
    photoUrl: d.photoUrl as string | undefined,
    coachId: (d.coachId as string) ?? '',
    coachName: (d.coachName as string) ?? '',
    totalPoints: (d.totalPoints as number) ?? 0,
    createdAt: (d.createdAt as Timestamp)?.toDate() ?? new Date(),
    clubId: d.clubId as string | undefined,
    gender: d.gender as ChildModel['gender'],
    beltReady: (d.beltReady as boolean) ?? false,
    bonusPoints: (d.bonusPoints as number) ?? 0,
    phone: d.phone as string | undefined,
  }
}

export function useChildren(coachId?: string) {
  const [children, setChildren] = useState<ChildModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coachId) { setLoading(false); return }
    const q = query(
      collection(db, 'children'),
      where('coachId', '==', coachId),
      orderBy('lastName')
    )
    const unsub = onSnapshot(q, (snap) => {
      setChildren(snap.docs.map(d => fromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [coachId])

  return { children, loading }
}

export function useChildById(childId?: string) {
  const [child, setChild] = useState<ChildModel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    const unsub = onSnapshot(doc(db, 'children', childId), (snap) => {
      setChild(snap.exists() ? fromFirestore(snap.id, snap.data() as Record<string, unknown>) : null)
      setLoading(false)
    })
    return unsub
  }, [childId])

  return { child, loading }
}

export function useChildrenByIds(ids: string[]) {
  const [children, setChildren] = useState<ChildModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ids.length) { setChildren([]); setLoading(false); return }
    const unsubs = ids.map(id =>
      onSnapshot(doc(db, 'children', id), (snap) => {
        if (snap.exists()) {
          setChildren(prev => {
            const filtered = prev.filter(c => c.id !== id)
            return [...filtered, fromFirestore(snap.id, snap.data() as Record<string, unknown>)]
          })
        }
      })
    )
    setLoading(false)
    return () => unsubs.forEach(u => u())
  }, [ids.join(',')])

  return { children, loading }
}

export async function saveChild(child: Omit<ChildModel, 'id' | 'createdAt'> & { id?: string }) {
  const id = child.id ?? crypto.randomUUID()
  const data: Record<string, unknown> = {
    firstName: child.firstName,
    lastName: child.lastName,
    birthYear: child.birthYear,
    weightCategory: child.weightCategory,
    currentBelt: child.currentBelt,
    coachId: child.coachId,
    coachName: child.coachName,
    totalPoints: child.totalPoints,
    bonusPoints: child.bonusPoints ?? 0,
    createdAt: serverTimestamp(),
  }
  if (child.photoUrl) data.photoUrl = child.photoUrl
  if (child.clubId)   data.clubId   = child.clubId
  if (child.gender)   data.gender   = child.gender
  if (child.phone)    data.phone    = child.phone
  await setDoc(doc(db, 'children', id), data, { merge: true })
  return id
}

export async function updateChildBelt(childId: string, belt: ChildModel['currentBelt']) {
  await updateDoc(doc(db, 'children', childId), { currentBelt: belt })
}

export async function deleteChild(childId: string) {
  await deleteDoc(doc(db, 'children', childId))
}
