'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import type { MembershipModel, Tariff } from '../types'

function memberFromFirestore(id: string, d: Record<string, unknown>): MembershipModel {
  return {
    id,
    childId: (d.childId as string) ?? '',
    parentId: (d.parentId as string) ?? '',
    tariffId: (d.tariffId as string) ?? '',
    tariffName: (d.tariffName as string) ?? '',
    startDate: (d.startDate as Timestamp)?.toDate() ?? new Date(),
    endDate: (d.endDate as Timestamp)?.toDate() ?? new Date(),
    status: (d.status as MembershipModel['status']) ?? 'pending',
    amountPaid: (d.amountPaid as number) ?? 0,
    paidAt: (d.paidAt as Timestamp)?.toDate(),
    notes: d.notes as string | undefined,
  }
}

export function useMemberships() {
  const [memberships, setMemberships] = useState<MembershipModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'memberships'), orderBy('endDate', 'desc')),
      (snap) => {
        setMemberships(snap.docs.map(d => memberFromFirestore(d.id, d.data() as Record<string, unknown>)))
        setLoading(false)
      }
    )
    return unsub
  }, [])

  return { memberships, loading }
}

export function useChildMembership(childId?: string) {
  const [membership, setMembership] = useState<MembershipModel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    const q = query(
      collection(db, 'memberships'),
      where('childId', '==', childId),
      orderBy('endDate', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      const active = snap.docs.find(d => (d.data() as Record<string, unknown>).status === 'active')
      setMembership(active ? memberFromFirestore(active.id, active.data() as Record<string, unknown>) : null)
      setLoading(false)
    })
    return unsub
  }, [childId])

  return { membership, loading }
}

export function useTariffs() {
  const [tariffs, setTariffs] = useState<Tariff[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'tariffs'), where('isActive', '==', true)),
      (snap) => {
        setTariffs(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Tariff, 'id'>) })))
        setLoading(false)
      }
    )
    return unsub
  }, [])

  return { tariffs, loading }
}

export async function saveMembership(m: Omit<MembershipModel, 'id'> & { id?: string }): Promise<string> {
  const id = m.id ?? crypto.randomUUID()
  await setDoc(doc(db, 'memberships', id), {
    childId: m.childId, parentId: m.parentId, tariffId: m.tariffId,
    tariffName: m.tariffName, startDate: m.startDate, endDate: m.endDate,
    status: m.status, amountPaid: m.amountPaid,
    ...(m.paidAt ? { paidAt: m.paidAt } : {}),
    ...(m.notes ? { notes: m.notes } : {}),
  }, { merge: true })
  return id
}
