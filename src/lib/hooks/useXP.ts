'use client'
import { useState, useEffect } from 'react'
import {
  collection, query, where, orderBy, limit,
  onSnapshot, addDoc, runTransaction, doc, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { XpTransaction, XpSource } from '@/lib/types'

function toDate(v: unknown): Date {
  if (v instanceof Date) return v
  if (v && typeof v === 'object' && 'toDate' in v) return (v as Timestamp).toDate()
  return new Date()
}

function txFromDoc(d: { id: string; data(): Record<string, unknown> }): XpTransaction {
  const data = d.data()
  return {
    id: d.id,
    childId: data.childId as string,
    coachId: data.coachId as string | undefined,
    amount: data.amount as number,
    source: data.source as XpSource,
    description: data.description as string,
    referenceId: data.referenceId as string | undefined,
    createdAt: toDate(data.createdAt),
  }
}

export function useXPHistory(childId: string | undefined, maxItems = 50) {
  const [transactions, setTransactions] = useState<XpTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    const q = query(
      collection(db, 'xp_transactions'),
      where('childId', '==', childId),
      orderBy('createdAt', 'desc'),
      limit(maxItems),
    )
    const unsub = onSnapshot(q, snap => {
      setTransactions(snap.docs.map(txFromDoc))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [childId, maxItems])

  return { transactions, loading }
}

export async function addXP(params: {
  childId: string
  amount: number
  source: XpSource
  description: string
  coachId?: string
  referenceId?: string
}) {
  const childRef = doc(db, 'children', params.childId)
  await runTransaction(db, async t => {
    const childSnap = await t.get(childRef)
    if (!childSnap.exists()) throw new Error('Child not found')
    const current = (childSnap.data().totalPoints as number) ?? 0
    t.update(childRef, { totalPoints: current + params.amount })
    const txRef = doc(collection(db, 'xp_transactions'))
    t.set(txRef, {
      childId: params.childId,
      coachId: params.coachId ?? null,
      amount: params.amount,
      source: params.source,
      description: params.description,
      referenceId: params.referenceId ?? null,
      createdAt: serverTimestamp(),
    })
  })
}

export async function adjustXP(params: {
  childId: string
  delta: number
  coachId: string
  reason: string
}) {
  return addXP({
    childId: params.childId,
    amount: params.delta,
    source: 'manual',
    description: params.reason,
    coachId: params.coachId,
  })
}
