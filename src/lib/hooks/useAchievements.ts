'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import type { AchievementModel } from '../types'
import { ACHIEVEMENT_DEFS } from '../constants'

function fromFirestore(d: Record<string, unknown>): AchievementModel {
  return {
    childId: (d.childId as string) ?? '',
    achievementId: (d.achievementId as string) ?? '',
    earnedAt: (d.earnedAt as Timestamp)?.toDate() ?? new Date(),
    grantedByCoachId: d.grantedByCoachId as string | undefined,
    note: d.note as string | undefined,
  }
}

export function useChildAchievements(childId?: string) {
  const [earned, setEarned] = useState<AchievementModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    const q = query(collection(db, 'achievements'), where('childId', '==', childId))
    const unsub = onSnapshot(q, (snap) => {
      setEarned(snap.docs.map(d => fromFirestore(d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [childId])

  return { earned, loading }
}

export async function grantAchievement(childId: string, achievementId: string, coachId: string, note?: string) {
  const id = `${childId}_${achievementId}`
  await setDoc(doc(db, 'achievements', id), {
    childId,
    achievementId,
    earnedAt: serverTimestamp(),
    grantedByCoachId: coachId,
    ...(note ? { note } : {}),
  })
}

export async function revokeAchievement(childId: string, achievementId: string) {
  const { deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(db, 'achievements', `${childId}_${achievementId}`))
}

export function getAchievementDef(id: string) {
  return ACHIEVEMENT_DEFS.find(d => d.id === id)
}
