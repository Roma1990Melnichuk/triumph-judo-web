'use client'

import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import type { BeltLevel, BeltRequirementModel, BeltProgressModel, Exercise } from '../types'

function reqFromFirestore(belt: BeltLevel, d: Record<string, unknown>): BeltRequirementModel {
  return {
    belt,
    exercises: (d.exercises as Exercise[]) ?? [],
    updatedAt: (d.updatedAt as Timestamp)?.toDate() ?? new Date(),
    updatedByCoachId: (d.updatedByCoachId as string) ?? '',
  }
}

function progressFromFirestore(childId: string, belt: BeltLevel, d: Record<string, unknown>): BeltProgressModel {
  return {
    childId,
    belt,
    passed: (d.passed as Record<string, boolean>) ?? {},
    updatedAt: (d.updatedAt as Timestamp)?.toDate() ?? new Date(),
    updatedByCoachId: (d.updatedByCoachId as string) ?? '',
  }
}

export function useBeltRequirements() {
  const [requirements, setRequirements] = useState<Record<BeltLevel, BeltRequirementModel>>({} as Record<BeltLevel, BeltRequirementModel>)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'belt_requirements'), (snap) => {
      const map = {} as Record<BeltLevel, BeltRequirementModel>
      snap.docs.forEach(d => {
        const belt = d.id as BeltLevel
        map[belt] = reqFromFirestore(belt, d.data() as Record<string, unknown>)
      })
      setRequirements(map)
      setLoading(false)
    })
    return unsub
  }, [])

  return { requirements, loading }
}

export function useBeltProgress(childId?: string, belt?: BeltLevel) {
  const [progress, setProgress] = useState<BeltProgressModel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId || !belt) { setLoading(false); return }
    const unsub = onSnapshot(doc(db, 'belt_progress', `${childId}_${belt}`), (snap) => {
      setProgress(snap.exists()
        ? progressFromFirestore(childId, belt, snap.data() as Record<string, unknown>)
        : null
      )
      setLoading(false)
    })
    return unsub
  }, [childId, belt])

  return { progress, loading }
}

export async function saveRequirement(req: BeltRequirementModel) {
  await setDoc(doc(db, 'belt_requirements', req.belt), {
    exercises: req.exercises,
    updatedAt: serverTimestamp(),
    updatedByCoachId: req.updatedByCoachId,
  })
}

export async function toggleExercise(childId: string, belt: BeltLevel, exerciseId: string, passed: boolean, coachId: string) {
  const id = `${childId}_${belt}`
  await setDoc(doc(db, 'belt_progress', id), {
    childId,
    belt,
    [`passed.${exerciseId}`]: passed,
    updatedAt: serverTimestamp(),
    updatedByCoachId: coachId,
  }, { merge: true })
}

export function getPassedCount(progress: BeltProgressModel | null): number {
  if (!progress) return 0
  return Object.values(progress.passed).filter(Boolean).length
}
