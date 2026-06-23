'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useChildren, useChildById } from '@/lib/hooks/useChildren'
import { useChildMeals, useChildWaterLogs, getMealsForDate, getTotalWaterForDate, calcNutritionScore, saveMeal, logWater, deleteMeal } from '@/lib/hooks/useNutrition'
import { useNutritionTips, saveNutritionTip, markTipRead, useFoodProducts } from '@/lib/hooks/useBodyMeasurements'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { MEAL_TYPE_LABEL } from '@/lib/constants'
import { ChevronLeft, ChevronRight, Plus, Droplets, Trash2, Utensils, BookOpen, Apple, Lightbulb } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, dateKey } from '@/lib/utils'
import type { MealType } from '@/lib/types'

const CATEGORY_LABELS: Record<string, string> = {
  general: 'Загальне',
  preTrain: 'До тренування',
  postTrain: 'Після тренування',
  hydration: 'Гідратація',
  recovery: 'Відновлення',
}

const FOOD_CATEGORIES = ['All', 'Proteins', 'Vegetables', 'Grains', 'Fruits', 'Drinks'] as const
const FOOD_CATEGORY_LABELS: Record<string, string> = {
  All: 'Усі',
  Proteins: 'Білки',
  Vegetables: 'Овочі',
  Grains: 'Зернові',
  Fruits: 'Фрукти',
  Drinks: 'Напої',
}

type Tab = 'diary' | 'tips' | 'products'

export default function NutritionPage() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'
  const { children } = useChildren(isCoach ? userModel?.uid : undefined)
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<Tab>('diary')

  const childId = isCoach
    ? (selectedChildId || undefined)
    : userModel?.childIds?.[0]

  const { child } = useChildById(childId)
  const { meals, loading: mealsLoading } = useChildMeals(childId)
  const { logs, loading: logsLoading } = useChildWaterLogs(childId)

  // Tips
  const { tips: coachTips, loading: coachTipsLoading } = useNutritionTips(isCoach ? userModel?.uid : undefined)
  const { tips: allTips, loading: allTipsLoading } = useNutritionTips(isCoach ? undefined : undefined)
  const tips = isCoach ? coachTips : allTips
  const tipsLoading = isCoach ? coachTipsLoading : allTipsLoading

  // Food products
  const { products, loading: productsLoading } = useFoodProducts()

  // Diary state
  const [date, setDate] = useState(new Date())
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [mealForm, setMealForm] = useState({
    type: 'breakfast' as MealType,
    mealName: '',
    hasProtein: false, hasVegetables: false, hasCarbs: false, hasFruits: false, hadWater: false,
    calories: '', comment: '',
  })

  // Tips state
  const [showAddTip, setShowAddTip] = useState(false)
  const [savingTip, setSavingTip] = useState(false)
  const [tipForm, setTipForm] = useState({ title: '', body: '', category: 'general' })
  const [tipCategoryFilter, setTipCategoryFilter] = useState<string>('all')

  // Products state
  const [productCategory, setProductCategory] = useState<string>('All')

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

  const handleSaveTip = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userModel?.uid || !tipForm.title.trim() || !tipForm.body.trim()) return
    setSavingTip(true)
    try {
      await saveNutritionTip({
        title: tipForm.title,
        body: tipForm.body,
        category: tipForm.category,
        coachId: userModel.uid,
      })
      toast.success('Пораду додано')
      setShowAddTip(false)
      setTipForm({ title: '', body: '', category: 'general' })
    } catch {
      toast.error('Помилка')
    } finally {
      setSavingTip(false)
    }
  }

  const handleMarkRead = async (tipId: string) => {
    if (!childId) return
    try {
      await markTipRead(tipId, childId)
    } catch {
      toast.error('Помилка')
    }
  }

  const isToday = dateKey(date) === dateKey(new Date())

  const filteredTips = tipCategoryFilter === 'all'
    ? tips
    : tips.filter(t => t.category === tipCategoryFilter)

  const filteredProducts = productCategory === 'All'
    ? products
    : products.filter(p => p.category === productCategory)

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'diary', label: 'Щоденник', icon: <BookOpen size={15} /> },
    { id: 'tips', label: 'Поради', icon: <Lightbulb size={15} /> },
    { id: 'products', label: 'Продукти', icon: <Apple size={15} /> },
  ]

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold font-display text-[#F5F5F5]">Харчування</h1>
        {isCoach && (
          <Select value={selectedChildId} onChange={e => setSelectedChildId(e.target.value)} label="">
            <option value="">Оберіть спортсмена...</option>
            {children.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
          </Select>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl bg-[#12100F] border border-[#34201A]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-[#E30613] text-white shadow'
                : 'text-[#9A9692] hover:text-[#F5F5F5]'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB: DIARY ── */}
      {activeTab === 'diary' && (
        <>
          {!childId ? (
            <div className="p-10 text-center">
              <Utensils size={32} className="mx-auto mb-3 text-[#9A9692]" />
              <p className="text-sm text-[#9A9692]">Оберіть спортсмена</p>
            </div>
          ) : (
            <>
              {/* Date nav */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1A120F] border border-[#34201A]">
                <button onClick={prevDay} className="p-1.5 rounded-lg hover:bg-[#34201A] text-[#9A9692] hover:text-[#F5F5F5] transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <div className="text-center">
                  <p className="font-semibold text-[#F5F5F5]">{isToday ? 'Сьогодні' : formatDate(date)}</p>
                  {!isToday && <p className="text-xs text-[#9A9692]">{formatDate(date)}</p>}
                </div>
                <button onClick={nextDay} className="p-1.5 rounded-lg hover:bg-[#34201A] text-[#9A9692] hover:text-[#F5F5F5] transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Nutrition score + water */}
              <div className="grid grid-cols-2 gap-3">
                <div className="tr-card p-4">
                  <p className="text-xs text-[#9A9692] mb-1">Оцінка харчування</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold font-display text-[#FFC400]">{score}</span>
                    <span className="text-sm text-[#9A9692] mb-1">/90</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#34201A] mt-2 overflow-hidden">
                    <div className="h-full rounded-full bg-[#FFC400] transition-all" style={{ width: `${Math.round(score / 90 * 100)}%` }} />
                  </div>
                </div>
                <div className="tr-card p-4">
                  <p className="text-xs text-[#9A9692] mb-1">Вода</p>
                  <div className="flex items-end gap-1">
                    <Droplets size={18} className="text-[#29B6F6] mb-1" />
                    <span className="text-3xl font-bold font-display text-[#29B6F6]">{waterMl}</span>
                    <span className="text-sm text-[#9A9692] mb-1">мл</span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <button onClick={() => handleLogWater(250)} className="flex-1 h-7 rounded-lg bg-[#29B6F6]/10 text-[#29B6F6] text-xs font-semibold hover:bg-[#29B6F6]/20 transition-colors">+250</button>
                    <button onClick={() => handleLogWater(500)} className="flex-1 h-7 rounded-lg bg-[#29B6F6]/10 text-[#29B6F6] text-xs font-semibold hover:bg-[#29B6F6]/20 transition-colors">+500</button>
                  </div>
                </div>
              </div>

              {/* Meals */}
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-[#F5F5F5]">Прийоми їжі</h2>
                <button
                  onClick={() => setShowAdd(true)}
                  className="tr-btn-brand flex items-center gap-1.5 h-9 px-4 text-sm"
                >
                  <Plus size={14} />Додати
                </button>
              </div>

              {mealsLoading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-[#12100F] animate-pulse" />)}</div>
              ) : dayMeals.length === 0 ? (
                <p className="text-sm text-[#9A9692]">Немає записів за цей день</p>
              ) : (
                <div className="space-y-2">
                  {dayMeals.map(meal => (
                    <div key={meal.id} className="flex items-start gap-3 p-3 rounded-2xl bg-[#12100F] border border-[#34201A]">
                      <div className="size-8 rounded-xl bg-[#E30613]/10 flex items-center justify-center shrink-0">
                        <Utensils size={14} className="text-[#E30613]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#F5F5F5]">{meal.mealName}</span>
                          <Badge variant="default" className="text-[10px]">{MEAL_TYPE_LABEL[meal.type]}</Badge>
                        </div>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {meal.hasProtein && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E30613]/10 text-[#E30613]">Білки</span>}
                          {meal.hasVegetables && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#63D728]/10 text-[#63D728]">Овочі</span>}
                          {meal.hasCarbs && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FFC400]/10 text-[#FFC400]">Вуглев.</span>}
                          {meal.hasFruits && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF6A00]/10 text-[#FF6A00]">Фрукти</span>}
                          {meal.calories && <span className="text-[10px] text-[#9A9692]">{meal.calories} ккал</span>}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteMeal(meal.id)} className="p-1 text-[#9A9692] hover:text-[#E30613] transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── TAB: TIPS ── */}
      {activeTab === 'tips' && (
        <div className="space-y-4">
          {isCoach ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-[#F5F5F5]">Поради для спортсменів</h2>
                <button
                  onClick={() => setShowAddTip(true)}
                  className="tr-btn-brand flex items-center gap-1.5 h-9 px-4 text-sm"
                >
                  <Plus size={14} />Додати пораду
                </button>
              </div>

              {tipsLoading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-[#12100F] animate-pulse" />)}</div>
              ) : tips.length === 0 ? (
                <div className="p-10 text-center">
                  <Lightbulb size={32} className="mx-auto mb-3 text-[#9A9692]" />
                  <p className="text-sm text-[#9A9692]">Ще немає порад. Додайте першу!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tips.map(tip => (
                    <div key={tip.id} className="tr-card p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-[#F5F5F5]">{tip.title}</p>
                        <Badge variant="gold">{CATEGORY_LABELS[tip.category] ?? tip.category}</Badge>
                      </div>
                      <p className="text-sm text-[#9A9692] leading-relaxed">{tip.body}</p>
                      <p className="text-xs text-[#9A9692]">{formatDate(tip.publishedAt)} · {tip.readBy.length} прочитали</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Category filter pills */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setTipCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    tipCategoryFilter === 'all'
                      ? 'bg-[#E30613] text-white'
                      : 'bg-[#1A120F] text-[#9A9692] border border-[#34201A] hover:text-[#F5F5F5]'
                  }`}
                >
                  Усі
                </button>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setTipCategoryFilter(key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      tipCategoryFilter === key
                        ? 'bg-[#E30613] text-white'
                        : 'bg-[#1A120F] text-[#9A9692] border border-[#34201A] hover:text-[#F5F5F5]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tipsLoading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-[#12100F] animate-pulse" />)}</div>
              ) : filteredTips.length === 0 ? (
                <div className="p-10 text-center">
                  <Lightbulb size={32} className="mx-auto mb-3 text-[#9A9692]" />
                  <p className="text-sm text-[#9A9692]">Порад ще немає</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTips.map(tip => {
                    const isUnread = childId ? !tip.readBy.includes(childId) : false
                    return (
                      <div
                        key={tip.id}
                        onClick={() => isUnread && handleMarkRead(tip.id)}
                        className={`tr-card p-4 space-y-2 cursor-pointer transition-all ${
                          isUnread ? 'border-l-4 border-l-[#E30613] border-[#34201A]' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-[#F5F5F5]">{tip.title}</p>
                          <Badge variant="gold">{CATEGORY_LABELS[tip.category] ?? tip.category}</Badge>
                        </div>
                        <p className="text-sm text-[#9A9692] leading-relaxed">{tip.body}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#9A9692]">{formatDate(tip.publishedAt)}</p>
                          {isUnread && <span className="text-xs text-[#E30613] font-semibold">Нове</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TAB: PRODUCTS ── */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <h2 className="font-semibold text-[#F5F5F5]">Продукти харчування</h2>

          {/* Category filter chips */}
          <div className="flex gap-2 flex-wrap">
            {FOOD_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setProductCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  productCategory === cat
                    ? 'bg-[#FF6A00] text-white'
                    : 'bg-[#1A120F] text-[#9A9692] border border-[#34201A] hover:text-[#F5F5F5]'
                }`}
              >
                {FOOD_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-[#12100F] animate-pulse" />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-10 text-center">
              <Apple size={32} className="mx-auto mb-3 text-[#9A9692]" />
              <p className="text-sm text-[#9A9692]">Продукти не знайдено</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map(product => (
                <div key={product.id} className="tr-card p-3 space-y-2">
                  <p className="font-semibold text-sm text-[#F5F5F5] leading-snug">{product.name}</p>
                  <Badge variant="gold">{product.category}</Badge>
                  <p className="text-lg font-bold font-display text-[#FFC400]">{product.calories} <span className="text-xs font-normal text-[#9A9692]">ккал</span></p>
                  <p className="text-[10px] text-[#9A9692]">
                    Б:{product.protein}г&nbsp; Ж:{product.fat}г&nbsp; В:{product.carbs}г
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Meal Dialog */}
      <Dialog open={showAdd} onClose={() => setShowAdd(false)} title="Додати прийом їжі">
        <form onSubmit={handleSaveMeal} className="space-y-4">
          <Select label="Тип" value={mealForm.type} onChange={e => setMealForm(f => ({ ...f, type: e.target.value as MealType }))}>
            {Object.entries(MEAL_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Input label="Назва страви" value={mealForm.mealName} onChange={e => setMealForm(f => ({ ...f, mealName: e.target.value }))} placeholder="Вівсянка, Борщ..." required />
          <div>
            <p className="text-sm text-[#9A9692] mb-2">Склад</p>
            <div className="grid grid-cols-2 gap-2">
              {([['hasProtein','Білки'],['hasVegetables','Овочі'],['hasCarbs','Вуглеводи'],['hasFruits','Фрукти'],['hadWater','Вода']] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={mealForm[key]} onChange={e => setMealForm(f => ({ ...f, [key]: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[#E30613]" />
                  <span className="text-sm text-[#9A9692]">{label}</span>
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

      {/* Add Tip Dialog */}
      <Dialog open={showAddTip} onClose={() => setShowAddTip(false)} title="Додати пораду">
        <form onSubmit={handleSaveTip} className="space-y-4">
          <Input
            label="Заголовок"
            value={tipForm.title}
            onChange={e => setTipForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Наприклад: Їжте більше білків..."
            required
          />
          <div>
            <label className="block text-sm text-[#9A9692] mb-1.5">Текст поради</label>
            <textarea
              value={tipForm.body}
              onChange={e => setTipForm(f => ({ ...f, body: e.target.value }))}
              rows={4}
              placeholder="Детальний опис поради..."
              required
              className="w-full rounded-2xl bg-[#1A120F] border border-[#34201A] text-[#F5F5F5] text-sm px-4 py-3 resize-none placeholder:text-[#9A9692] focus:outline-none focus:border-[#E30613] transition-colors"
            />
          </div>
          <Select
            label="Категорія"
            value={tipForm.category}
            onChange={e => setTipForm(f => ({ ...f, category: e.target.value }))}
          >
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" type="button" onClick={() => setShowAddTip(false)}>Скасувати</Button>
            <Button type="submit" loading={savingTip}>Зберегти</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
