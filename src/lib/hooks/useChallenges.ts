'use client'
import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { LoyaltyChallenge, ChallengeProgress, ChallengeMetric } from '@/lib/types'

function toDate(v: unknown): Date {
  if (v instanceof Date) return v
  if (v && typeof v === 'object' && 'toDate' in v) return (v as Timestamp).toDate()
  return new Date()
}

function challengeFromDoc(d: { id: string; data(): Record<string, unknown> }): LoyaltyChallenge {
  const data = d.data()
  return {
    id: d.id,
    title: data.title as string,
    description: data.description as string,
    emoji: data.emoji as string,
    type: data.type as 'individual' | 'team',
    targetValue: data.targetValue as number,
    metric: data.metric as ChallengeMetric,
    xpReward: data.xpReward as number,
    startDate: toDate(data.startDate),
    endDate: toDate(data.endDate),
    coachId: data.coachId as string,
    clubId: data.clubId as string | undefined,
    targetChildIds: data.targetChildIds as string[] | undefined,
    isActive: data.isActive as boolean,
  }
}

function progressFromDoc(d: { id: string; data(): Record<string, unknown> }): ChallengeProgress {
  const data = d.data()
  return {
    id: d.id,
    challengeId: data.challengeId as string,
    childId: data.childId as string,
    currentValue: data.currentValue as number,
    completed: data.completed as boolean,
    completedAt: data.completedAt ? toDate(data.completedAt) : undefined,
  }
}

export function useChallenges(childId?: string) {
  const [challenges, setChallenges] = useState<LoyaltyChallenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'loyalty_challenges'),
      where('isActive', '==', true),
    )
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs.map(challengeFromDoc)
      const visible = childId
        ? all.filter(c => !c.targetChildIds || c.targetChildIds.includes(childId))
        : all
      setChallenges(visible)
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [childId])

  return { challenges, loading }
}

export function useChallengeProgress(childId: string | undefined) {
  const [progress, setProgress] = useState<ChallengeProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    const q = query(
      collection(db, 'challenge_progress'),
      where('childId', '==', childId),
    )
    const unsub = onSnapshot(q, snap => {
      setProgress(snap.docs.map(progressFromDoc))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [childId])

  return { progress, loading }
}
