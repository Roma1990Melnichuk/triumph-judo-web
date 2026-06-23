'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useChildren, useChildById } from '@/lib/hooks/useChildren'
import { useChildMeals, useChildWaterLogs, getMealsForDate, getTotalWaterForDate, calcNutritionScore, saveMeal, logWater, deleteMeal } from '@/lib/hooks/useNutrition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { MEAL_TYPE_LABEL } from '@/lib/constants'
import { ChevronLeft, ChevronRight, Plus, Droplets, Trash2, Utensils } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, dateKey } from '@/lib/utils'
import type { MealType } from '@/lib/types'

export default function NutritionPage() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'
  const { children } = useChildren(isCoach ? userModel?.uid : undefined)
  const [selectedChildId, setSelectedChildId] = useState<string>('')

  const childId = isCoach
    ? (selectedChildId || undefined)
    : userModel?.childIds?.[0]

  const { child } = useChildById(childId)
  const { meals, loading: mealsLoading } = useChildMeals(childId)
  const { logs, loading: logsLoading } = useChildWaterLogs(childId)

  const [date, setDate] = useState(new Date())
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [mealForm, setMealForm] = useState({
    type: 'breakfast' as MealType,
    mealName: '',
    hasProtein: false, hasVegetables: false, hasCarbs: false, hasFruits: false, hadWater: false,
    calories: '', comment: '',
  })

  const prevDay = () => { const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d) }
  const nextDay = () => { const d = new Date(date); d.setDate(d.getDate() + 1); setDate(d) }

  const dayMeals = getMealsForDate(meals, date)
  const waterMl = getTotalWaterForDate(logs, date)
  const score = calcNutritionScore(dayMeals, waterMl)

  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!childId || !mealForm.mealName.trim()) return
    setSaving(true)
    try {
      await saveMeal({
        childId,
        type: mealForm.type,
        date,
        mealName: mealForm.mealName,
        hasProtein: mealForm.hasProtein,
        hasVegetables: mealForm.hasVegetables,
        hasCarbs: mealForm.hasCarbs,
        hasFruits: mealForm.hasFruits,
        hadWater: mealForm.hadWater,
        calories: mealForm.calories ? parseInt(mealForm.calories) : undefined,
        comment: mealForm.comment,
        status: 'done',
      })
      toast.success('Прийом їжі додано')
      setShowAdd(false)
      setMealForm({ type: 'breakfast', mealName: '', hasProtein: false, hasVegetables: false, hasCarbs: false, hasFruits: false, hadWater: false, calories: '', comment: '' })
    } catch {
      toast.error('Помилка')
    } finally {
      setSaving(false)
    }
  }

  const handleLogWater = async (ml: number) => {
    if (!childId) return
    try {
      await logWater(childId, ml)
      toast.success(`+${ml} мл`)
    } catch {
      toast.error('Помилка')
    }
  }

  const handleDeleteMeal = async (id: string) => {
    try {
      await deleteMeal(id)
      toast.success('Видалено')
    } catch {
      toast.error('Помилка')
    }
  }

  const isToday = dateKey(date) === dateKey(new Date())

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#F7F5F2]">Харчування</h1>
        {isCoach && (
          <Select value={selectedChildId} onChange={e => setSelectedChildId(e.target.value)} className="max-w-48">
            <option value="">Оберіть спортсмена...</option>
            {children.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
          </Select>
        )}
      </div>

      {!childId ? (
        <div className="p-10 text-center">
          <Utensils size={32} className="mx-auto mb-3 text-[#746E68]" />
          <p className="text-sm text-[#746E68]">Оберіть спортсмена</p>
        </div>
      ) : (
        <>
          {/* Date nav */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#120605] border border-[#2A1410]">
            <button onClick={prevDay} className="p-1.5 rounded-lg hover:bg-[#1B0A08] text-[#746E68] hover:text-[#F7F5F2] transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <p className="font-semibold text-[#F7F5F2]">{isToday ? 'Сьогодні' : formatDate(date)}</p>
              {!isToday && <p className="text-xs text-[#746E68]">{formatDate(date)}</p>}
            </div>
            <button onClick={nextDay} className="p-1.5 rounded-lg hover:bg-[#1B0A08] text-[#746E68] hover:text-[#F7F5F2] transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Nutrition score */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-[#746E68] mb-1">Оцінка харчування</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-[#FFD21A]">{score}</span>
                  <span className="text-sm text-[#746E68] mb-1">/90</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#1B0A08] mt-2 overflow-hidden">
                  <div className="h-full rounded-full bg-[#FFD21A] transition-all" style={{ width: `${Math.round(score / 90 * 100)}%` }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-[#746E68] mb-1">Вода</p>
                <div className="flex items-end gap-1">
                  <Droplets size={18} className="text-[#29B6F6] mb-1" />
                  <span className="text-3xl font-bold text-[#29B6F6]">{waterMl}</span>
                  <span className="text-sm text-[#746E68] mb-1">мл</span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  <button onClick={() => handleLogWater(250)} className="flex-1 h-7 rounded-lg bg-[#29B6F6]/10 text-[#29B6F6] text-xs font-semibold hover:bg-[#29B6F6]/20 transition-colors">+250</button>
                  <button onClick={() => handleLogWater(500)} className="flex-1 h-7 rounded-lg bg-[#29B6F6]/10 text-[#29B6F6] text-xs font-semibold hover:bg-[#29B6F6]/20 transition-colors">+500</button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Meals */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#F7F5F2]">Прийоми їжі</h2>
            <Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} className="mr-1" />Додати</Button>
          </div>

          {mealsLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-[#120605] animate-pulse" />)}</div>
          ) : dayMeals.length === 0 ? (
            <p className="text-sm text-[#746E68]">Немає записів за цей день</p>
          ) : (
            <div className="space-y-2">
              {dayMeals.map(meal => (
                <div key={meal.id} className="flex items-start gap-3 p-3 rounded-2xl bg-[#120605] border border-[#2A1410]">
                  <div className="size-8 rounded-xl bg-[#D50000]/10 flex items-center justify-center shrink-0">
                    <Utensils size={14} className="text-[#D50000]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#F7F5F2]">{meal.mealName}</span>
                      <Badge variant="default" className="text-[10px]">{MEAL_TYPE_LABEL[meal.type]}</Badge>
                    </div>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      {meal.hasProtein && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#D50000]/10 text-[#D50000]">Білки</span>}
                      {meal.hasVegetables && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#63D728]/10 text-[#63D728]">Овочі</span>}
                      {meal.hasCarbs && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FFD21A]/10 text-[#FFD21A]">Вуглев.</span>}
                      {meal.hasFruits && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF8A00]/10 text-[#FF8A00]">Фрукти</span>}
                      {meal.calories && <span className="text-[10px] text-[#746E68]">{meal.calories} ккал</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteMeal(meal.id)} className="p-1 text-[#746E68] hover:text-[#FF3B30] transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} title="Додати прийом їжі">
        <form onSubmit={handleSaveMeal} className="space-y-4">
          <Select label="Тип" value={mealForm.type} onChange={e => setMealForm(f => ({ ...f, type: e.target.value as MealType }))}>
            {Object.entries(MEAL_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Input label="Назва страви" value={mealForm.mealName} onChange={e => setMealForm(f => ({ ...f, mealName: e.target.value }))} placeholder="Вівсянка, Борщ..." required />
          <div>
            <p className="text-sm text-[#B7B0A8] mb-2">Склад</p>
            <div className="grid grid-cols-2 gap-2">
              {([['hasProtein','Білки'],['hasVegetables','Овочі'],['hasCarbs','Вуглеводи'],['hasFruits','Фрукти'],['hadWater','Вода']] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={mealForm[key]} onChange={e => setMealForm(f => ({ ...f, [key]: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[#D50000]" />
                  <span className="text-sm text-[#B7B0A8]">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <Input label="Калорії (необов'язково)" type="number" value={mealForm.calories} onChange={e => setMealForm(f => ({ ...f, calories: e.target.value }))} placeholder="350" />
          <Input label="Коментар" value={mealForm.comment} onChange={e => setMealForm(f => ({ ...f, comment: e.target.value }))} placeholder="Примітка..." />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Скасувати</Button>
            <Button type="submit" loading={saving}>Додати</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
