'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot, doc, addDoc, deleteDoc, updateDoc, serverTimestamp, Timestamp, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase'

export interface MeasurementDoc {
  id: string
  childId: string
  measuredAt: Date
  weightKg?: number
  heightCm?: number
}

export interface TipDoc {
  id: string
  title: string
  body: string
  category: string
  publishedAt: Date
  coachId: string
  readBy: string[]
}

export interface FoodProductDoc {
  id: string
  name: string
  category: string
  description: string
  calories: number
  protein: number
  fat: number
  carbs: number
}

function measurementFromFirestore(id: string, d: Record<string, unknown>): MeasurementDoc {
  return {
    id,
    childId: (d.childId as string) ?? '',
    measuredAt: (d.measuredAt as Timestamp)?.toDate() ?? new Date(),
    weightKg: d.weightKg as number | undefined,
    heightCm: d.heightCm as number | undefined,
  }
}

function tipFromFirestore(id: string, d: Record<string, unknown>): TipDoc {
  return {
    id,
    title: (d.title as string) ?? '',
    body: (d.body as string) ?? '',
    category: (d.category as string) ?? 'general',
    publishedAt: (d.publishedAt as Timestamp)?.toDate() ?? new Date(),
    coachId: (d.coachId as string) ?? '',
    readBy: (d.readBy as string[]) ?? [],
  }
}

function productFromFirestore(id: string, d: Record<string, unknown>): FoodProductDoc {
  return {
    id,
    name: (d.name as string) ?? '',
    category: (d.category as string) ?? '',
    description: (d.description as string) ?? '',
    calories: (d.calories as number) ?? 0,
    protein: (d.protein as number) ?? 0,
    fat: (d.fat as number) ?? 0,
    carbs: (d.carbs as number) ?? 0,
  }
}

export function useBodyMeasurements(childId?: string) {
  const [measurements, setMeasurements] = useState<MeasurementDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    const q = query(
      collection(db, 'body_measurements'),
      where('childId', '==', childId),
      orderBy('measuredAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setMeasurements(snap.docs.map(d => measurementFromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [childId])

  const latestWeight = measurements[0]?.weightKg
  const latestHeight = measurements[0]?.heightCm

  return { measurements, loading, latestWeight, latestHeight }
}

export async function saveMeasurement(data: { childId: string; weightKg?: number; heightCm?: number }): Promise<void> {
  await addDoc(collection(db, 'body_measurements'), {
    childId: data.childId,
    weightKg: data.weightKg ?? null,
    heightCm: data.heightCm ?? null,
    measuredAt: serverTimestamp(),
  })
}

export async function deleteMeasurement(id: string): Promise<void> {
  await deleteDoc(doc(db, 'body_measurements', id))
}

export function calcBMI(weightKg: number, heightCm: number): number {
  return Math.round((weightKg / (heightCm / 100) ** 2) * 10) / 10
}

export function useNutritionTips(coachId?: string) {
  const [tips, setTips] = useState<TipDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = coachId
      ? query(collection(db, 'nutrition_tips'), where('coachId', '==', coachId))
      : query(collection(db, 'nutrition_tips'))
    const unsub = onSnapshot(q, (snap) => {
      setTips(snap.docs.map(d => tipFromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [coachId])

  return { tips, loading }
}

export async function saveNutritionTip(data: { title: string; body: string; category: string; coachId: string }): Promise<void> {
  await addDoc(collection(db, 'nutrition_tips'), {
    title: data.title,
    body: data.body,
    category: data.category,
    coachId: data.coachId,
    publishedAt: serverTimestamp(),
    readBy: [],
  })
}

export async function markTipRead(tipId: string, childId: string): Promise<void> {
  await updateDoc(doc(db, 'nutrition_tips', tipId), {
    readBy: arrayUnion(childId),
  })
}

export function useFoodProducts() {
  const [products, setProducts] = useState<FoodProductDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'food_products'), orderBy('category'))
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => productFromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [])

  return { products, loading }
}
