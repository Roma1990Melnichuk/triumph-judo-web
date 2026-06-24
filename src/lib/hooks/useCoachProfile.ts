'use client'
import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { CoachProfile, UserModel } from '@/lib/types'

function toDate(v: unknown): Date {
  if (v instanceof Date) return v
  if (v && typeof v === 'object' && 'toDate' in v) return (v as Timestamp).toDate()
  return new Date()
}

const DEFAULTS: Omit<CoachProfile, 'uid' | 'updatedAt'> = {
  bio: '',
  slogan: '',
  experienceYears: 0,
  danLevel: 1,
  qualifications: [],
  trainerStats: { studentMedals: 0, nationalPrizes: 0, totalStudents: 0 },
  trainingPhotos: [],
}

function fromDoc(uid: string, d: Record<string, unknown>): CoachProfile {
  const stats = (d.trainerStats as Record<string, unknown>) ?? {}
  return {
    uid,
    bio: (d.bio as string) ?? '',
    slogan: (d.slogan as string) ?? '',
    experienceYears: (d.experienceYears as number) ?? 0,
    danLevel: (d.danLevel as number) ?? 1,
    qualifications: (d.qualifications as string[]) ?? [],
    trainerStats: {
      studentMedals: (stats.studentMedals as number) ?? 0,
      nationalPrizes: (stats.nationalPrizes as number) ?? 0,
      totalStudents: (stats.totalStudents as number) ?? 0,
      specialTitle: stats.specialTitle as string | undefined,
    },
    trainingPhotos: (d.trainingPhotos as string[]) ?? [],
    updatedAt: toDate(d.updatedAt),
  }
}

export function useCoachProfile(uid: string | undefined) {
  const [profile, setProfile] = useState<CoachProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) { setLoading(false); return }
    const unsub = onSnapshot(doc(db, 'coach_profiles', uid), snap => {
      setProfile(snap.exists() ? fromDoc(uid, snap.data() as Record<string, unknown>) : null)
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [uid])

  return { profile, loading }
}

export function useCoachUserDoc(uid: string | undefined) {
  const [user, setUser] = useState<Pick<UserModel, 'uid' | 'name' | 'photoUrl' | 'email' | 'phone'> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) { setLoading(false); return }
    const unsub = onSnapshot(doc(db, 'users', uid), snap => {
      if (snap.exists()) {
        const d = snap.data() as Record<string, unknown>
        setUser({
          uid: snap.id,
          name: (d.name as string) ?? '',
          photoUrl: d.photoUrl as string | undefined,
          email: (d.email as string) ?? '',
          phone: d.phone as string | undefined,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [uid])

  return { user, loading }
}

export async function saveCoachProfile(uid: string, data: Partial<Omit<CoachProfile, 'uid' | 'updatedAt'>>) {
  await setDoc(doc(db, 'coach_profiles', uid), { ...data, updatedAt: new Date() }, { merge: true })
}
