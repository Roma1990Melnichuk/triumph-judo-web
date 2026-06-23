'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import type { MealModel, WaterLogModel } from '../types'
import { dateKey } from '../utils'

function mealFromFirestore(id: string, d: Record<string, unknown>): MealModel {
  return {
    id,
    childId: (d.childId as string) ?? '',
    type: (d.type as MealModel['type']) ?? 'breakfast',
    date: (d.date as Timestamp)?.toDate() ?? new Date(),
    photoUrl: d.photoUrl as string | undefined,
    mealName: (d.mealName as string) ?? '',
    hasProtein: (d.hasProtein as boolean) ?? false,
    hasVegetables: (d.hasVegetables as boolean) ?? false,
    hasCarbs: (d.hasCarbs as boolean) ?? false,
    hasFruits: (d.hasFruits as boolean) ?? false,
    hadWater: (d.hadWater as boolean) ?? false,
    calories: d.calories as number | undefined,
    comment: (d.comment as string) ?? '',
    status: (d.status as MealModel['status']) ?? 'done',
    createdAt: (d.createdAt as Timestamp)?.toDate() ?? new Date(),
  }
}

function waterFromFirestore(id: string, d: Record<string, unknown>): WaterLogModel {
  return {
    id,
    childId: (d.childId as string) ?? '',
    amountMl: (d.amountMl as number) ?? 0,
    loggedAt: (d.loggedAt as Timestamp)?.toDate() ?? new Date(),
  }
}

export function useChildMeals(childId?: string) {
  const [meals, setMeals] = useState<MealModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    const q = query(collection(db, 'meals'), where('childId', '==', childId))
    const unsub = onSnapshot(q, (snap) => {
      setMeals(snap.docs.map(d => mealFromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [childId])

  return { meals, loading }
}

export function useChildWaterLogs(childId?: string) {
  const [logs, setLogs] = useState<WaterLogModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    const q = query(collection(db, 'water_logs'), where('childId', '==', childId))
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => waterFromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [childId])

  return { logs, loading }
}

export function getMealsForDate(meals: MealModel[], date: Date): MealModel[] {
  const key = dateKey(date)
  return meals.filter(m => dateKey(m.date) === key)
}

export function getTotalWaterForDate(logs: WaterLogModel[], date: Date): number {
  const key = dateKey(date)
  return logs.filter(l => dateKey(l.loggedAt) === key).reduce((s, l) => s + l.amountMl, 0)
}

export function calcNutritionScore(meals: MealModel[], waterMl: number): number {
  if (!meals.length && waterMl === 0) return 0
  const done = meals.filter(m => m.status === 'done')
  const plateScore = done.length > 0
    ? done.reduce((s, m) => {
        let score = 0
        if (m.hasProtein)    score++
        if (m.hasVegetables) score++
        if (m.hasCarbs)      score++
        if (m.hasFruits)     score++
        if (m.hadWater)      score++
        return s + score / 5
      }, 0) / done.length
    : 0
  const waterScore = Math.min(waterMl / 1500, 1)
  const regularityScore = Math.min(done.length / 3, 1)
  return Math.round(plateScore * 40 + waterScore * 30 + regularityScore * 20)
}

export async function saveMeal(meal: Omit<MealModel, 'id' | 'createdAt'> & { id?: string }): Promise<string> {
  const id = meal.id ?? crypto.randomUUID()
  await setDoc(doc(db, 'meals', id), {
    childId: meal.childId,
    type: meal.type,
    date: meal.date,
    mealName: meal.mealName,
    hasProtein: meal.hasProtein,
    hasVegetables: meal.hasVegetables,
    hasCarbs: meal.hasCarbs,
    hasFruits: meal.hasFruits,
    hadWater: meal.hadWater,
    calories: meal.calories ?? null,
    comment: meal.comment,
    status: meal.status,
    createdAt: serverTimestamp(),
    ...(meal.photoUrl ? { photoUrl: meal.photoUrl } : {}),
  }, { merge: true })
  return id
}

export async function logWater(childId: string, amountMl: number): Promise<void> {
  const id = crypto.randomUUID()
  await setDoc(doc(db, 'water_logs', id), {
    childId,
    amountMl,
    loggedAt: serverTimestamp(),
  })
}

export async function deleteMeal(id: string) {
  await deleteDoc(doc(db, 'meals', id))
}
