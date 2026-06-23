'use client'
import { useState, useEffect } from 'react'
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { LoyaltyReward, RewardOrder, RewardCategory, LoyaltyLevel } from '@/lib/types'
import { addXP } from './useXP'

function toDate(v: unknown): Date {
  if (v instanceof Date) return v
  if (v && typeof v === 'object' && 'toDate' in v) return (v as Timestamp).toDate()
  return new Date()
}

function rewardFromDoc(d: { id: string; data(): Record<string, unknown> }): LoyaltyReward {
  const data = d.data()
  return {
    id: d.id,
    name: data.name as string,
    description: data.description as string,
    imageUrl: data.imageUrl as string | undefined,
    category: data.category as RewardCategory,
    xpCost: data.xpCost as number,
    stock: data.stock as number | undefined,
    minLevel: data.minLevel as LoyaltyLevel,
    isActive: data.isActive as boolean,
    createdAt: toDate(data.createdAt),
  }
}

function orderFromDoc(d: { id: string; data(): Record<string, unknown> }): RewardOrder {
  const data = d.data()
  return {
    id: d.id,
    childId: data.childId as string,
    rewardId: data.rewardId as string,
    rewardName: data.rewardName as string,
    xpCost: data.xpCost as number,
    status: data.status as RewardOrder['status'],
    createdAt: toDate(data.createdAt),
    processedAt: data.processedAt ? toDate(data.processedAt) : undefined,
    processedByCoachId: data.processedByCoachId as string | undefined,
    note: data.note as string | undefined,
  }
}

export function useLoyaltyRewards() {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'loyalty_rewards'),
      where('isActive', '==', true),
      orderBy('xpCost', 'asc'),
    )
    const unsub = onSnapshot(q, snap => {
      setRewards(snap.docs.map(rewardFromDoc))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  return { rewards, loading }
}

export function useRewardOrders(childId: string | undefined) {
  const [orders, setOrders] = useState<RewardOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    const q = query(
      collection(db, 'reward_orders'),
      where('childId', '==', childId),
      orderBy('createdAt', 'desc'),
    )
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(orderFromDoc))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [childId])

  return { orders, loading }
}

export async function redeemReward(childId: string, reward: LoyaltyReward) {
  await addDoc(collection(db, 'reward_orders'), {
    childId,
    rewardId: reward.id,
    rewardName: reward.name,
    xpCost: reward.xpCost,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
  await addXP({
    childId,
    amount: -reward.xpCost,
    source: 'reward_spend',
    description: `Обмін: ${reward.name}`,
  })
}
