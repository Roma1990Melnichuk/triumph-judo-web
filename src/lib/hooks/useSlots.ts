'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

export interface SlotDoc {
  id: string
  coachId: string
  coachName: string
  date: Date
  timeStart: string
  timeEnd: string
  price: number
  status: 'available' | 'requested' | 'confirmed' | 'cancelled'
  childId?: string
  childName?: string
  requestedByUserId?: string
  requestedAt?: Date
  confirmedAt?: Date
  isPaid: boolean
}

function fromFirestore(id: string, d: Record<string, unknown>): SlotDoc {
  return {
    id,
    coachId: (d.coachId as string) ?? '',
    coachName: (d.coachName as string) ?? '',
    date: (d.date as Timestamp)?.toDate() ?? new Date(),
    timeStart: (d.timeStart as string) ?? '',
    timeEnd: (d.timeEnd as string) ?? '',
    price: (d.price as number) ?? 0,
    status: (d.status as SlotDoc['status']) ?? 'available',
    childId: d.childId as string | undefined,
    childName: d.childName as string | undefined,
    requestedByUserId: d.requestedByUserId as string | undefined,
    requestedAt: (d.requestedAt as Timestamp)?.toDate() ?? undefined,
    confirmedAt: (d.confirmedAt as Timestamp)?.toDate() ?? undefined,
    isPaid: (d.isPaid as boolean) ?? false,
  }
}

export function useAvailableSlots(coachId?: string) {
  const [slots, setSlots] = useState<SlotDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coachId) { setLoading(false); return }
    const q = query(
      collection(db, 'individual_slots'),
      where('coachId', '==', coachId),
      where('status', '==', 'available'),
      orderBy('date', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setSlots(snap.docs.map(d => fromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [coachId])

  return { slots, loading }
}

export function useCoachSlots(coachId?: string) {
  const [slots, setSlots] = useState<SlotDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coachId) { setLoading(false); return }
    const q = query(
      collection(db, 'individual_slots'),
      where('coachId', '==', coachId),
      orderBy('date', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setSlots(snap.docs.map(d => fromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [coachId])

  return { slots, loading }
}

export function useChildBookedSlots(childId?: string) {
  const [slots, setSlots] = useState<SlotDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    const q = query(
      collection(db, 'individual_slots'),
      where('childId', '==', childId),
      where('status', 'in', ['requested', 'confirmed'])
    )
    const unsub = onSnapshot(q, (snap) => {
      setSlots(snap.docs.map(d => fromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [childId])

  return { slots, loading }
}

export async function createSlot(data: Omit<SlotDoc, 'id' | 'status' | 'isPaid'>): Promise<string> {
  const ref = await addDoc(collection(db, 'individual_slots'), {
    ...data,
    status: 'available',
    isPaid: false,
  })
  return ref.id
}

export async function requestSlot(
  slotId: string,
  childId: string,
  childName: string,
  requestedByUserId: string
): Promise<void> {
  await updateDoc(doc(db, 'individual_slots', slotId), {
    status: 'requested',
    childId,
    childName,
    requestedByUserId,
    requestedAt: serverTimestamp(),
  })
}

export async function confirmSlot(slotId: string): Promise<void> {
  await updateDoc(doc(db, 'individual_slots', slotId), {
    status: 'confirmed',
    confirmedAt: serverTimestamp(),
  })
}

export async function cancelSlot(slotId: string): Promise<void> {
  await updateDoc(doc(db, 'individual_slots', slotId), { status: 'cancelled' })
}

export async function deleteSlot(slotId: string): Promise<void> {
  await deleteDoc(doc(db, 'individual_slots', slotId))
}
