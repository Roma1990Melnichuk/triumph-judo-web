'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase'
import type { GroupModel } from '../types'
import { DAY_NAMES } from '../constants'

function fromFirestore(id: string, d: Record<string, unknown>): GroupModel {
  return {
    id,
    coachId: (d.coachId as string) ?? '',
    name: (d.name as string) ?? '',
    childIds: (d.childIds as string[]) ?? [],
    daysOfWeek: (d.daysOfWeek as number[]) ?? [],
    timeStart: (d.timeStart as string) ?? '18:00',
    timeEnd: (d.timeEnd as string) ?? '19:30',
  }
}

export function useGroups(coachId?: string) {
  const [groups, setGroups] = useState<GroupModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coachId) { setLoading(false); return }
    const q = query(collection(db, 'groups'), where('coachId', '==', coachId))
    const unsub = onSnapshot(q, (snap) => {
      setGroups(snap.docs.map(d => fromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [coachId])

  return { groups, loading }
}

export function useGroupById(id?: string) {
  const [group, setGroup] = useState<GroupModel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    const unsub = onSnapshot(doc(db, 'groups', id), (snap) => {
      setGroup(snap.exists() ? fromFirestore(snap.id, snap.data() as Record<string, unknown>) : null)
      setLoading(false)
    })
    return unsub
  }, [id])

  return { group, loading }
}

export function getDaysLabel(days: number[]): string {
  return days.map(d => DAY_NAMES[d - 1]).join(', ')
}

export function getTrainingDates(group: GroupModel, seasonYear: number): Date[] {
  const start = new Date(seasonYear, 8, 1)  // September
  const end   = new Date(seasonYear + 1, 6, 31) // July
  const dates: Date[] = []
  let d = new Date(start)
  while (d <= end) {
    if (group.daysOfWeek.includes(d.getDay() === 0 ? 7 : d.getDay())) {
      dates.push(new Date(d))
    }
    d.setDate(d.getDate() + 1)
  }
  return dates
}

export async function saveGroup(group: Omit<GroupModel, 'id'> & { id?: string }): Promise<string> {
  const id = group.id ?? crypto.randomUUID()
  await setDoc(doc(db, 'groups', id), {
    coachId: group.coachId,
    name: group.name,
    childIds: group.childIds,
    daysOfWeek: group.daysOfWeek,
    timeStart: group.timeStart,
    timeEnd: group.timeEnd,
  }, { merge: true })
  return id
}

export async function deleteGroup(id: string) {
  await deleteDoc(doc(db, 'groups', id))
}

export async function addChildToGroup(groupId: string, childId: string) {
  await updateDoc(doc(db, 'groups', groupId), { childIds: arrayUnion(childId) })
}

export async function removeChildFromGroup(groupId: string, childId: string) {
  await updateDoc(doc(db, 'groups', groupId), { childIds: arrayRemove(childId) })
}
