import { describe, it, expect } from 'vitest'
import { calcNutritionScore } from '@/lib/hooks/useNutrition'
import type { MealModel } from '@/lib/types'

const makeMeal = (overrides: Partial<MealModel> = {}): MealModel => ({
  id: 'meal1',
  childId: 'c1',
  type: 'breakfast',
  date: new Date(),
  mealName: 'Test',
  hasProtein: false,
  hasVegetables: false,
  hasCarbs: false,
  hasFruits: false,
  hadWater: false,
  comment: '',
  status: 'done',
  createdAt: new Date(),
  ...overrides,
})

describe('calcNutritionScore', () => {
  // 1. empty meals + 0 water → 0
  it('returns 0 for empty meals and 0 water', () => {
    expect(calcNutritionScore([], 0)).toBe(0)
  })

  // 2. full plate (all 5 components true) + 1500ml + 3 meals → 90
  //    plateScore=1, waterScore=1, regularityScore=1
  //    Math.round(1*40 + 1*30 + 1*20) = 90
  it('returns 90 for 3 fully-complete meals with 1500ml water', () => {
    const meals = [
      makeMeal({ id: 'm1', hasProtein: true, hasVegetables: true, hasCarbs: true, hasFruits: true, hadWater: true }),
      makeMeal({ id: 'm2', hasProtein: true, hasVegetables: true, hasCarbs: true, hasFruits: true, hadWater: true }),
      makeMeal({ id: 'm3', hasProtein: true, hasVegetables: true, hasCarbs: true, hasFruits: true, hadWater: true }),
    ]
    expect(calcNutritionScore(meals, 1500)).toBe(90)
  })

  // 3. water clamped: 9999ml treated same as 1500ml (waterScore clamped to 1)
  //    Same 3 full meals → still 90
  it('clamps water above 1500ml to 1500ml equivalent', () => {
    const meals = [
      makeMeal({ id: 'm1', hasProtein: true, hasVegetables: true, hasCarbs: true, hasFruits: true, hadWater: true }),
      makeMeal({ id: 'm2', hasProtein: true, hasVegetables: true, hasCarbs: true, hasFruits: true, hadWater: true }),
      makeMeal({ id: 'm3', hasProtein: true, hasVegetables: true, hasCarbs: true, hasFruits: true, hadWater: true }),
    ]
    expect(calcNutritionScore(meals, 9999)).toBe(calcNutritionScore(meals, 1500))
  })

  // 4. skipped meals excluded: 3 skipped + 0 water → 0
  it('excludes skipped meals from scoring', () => {
    const meals = [
      makeMeal({ id: 'm1', status: 'skipped' }),
      makeMeal({ id: 'm2', status: 'skipped' }),
      makeMeal({ id: 'm3', status: 'skipped' }),
    ]
    expect(calcNutritionScore(meals, 0)).toBe(0)
  })

  // 5. pending meals excluded: same as skipped
  it('excludes pending meals from scoring', () => {
    const meals = [
      makeMeal({ id: 'm1', status: 'pending' }),
      makeMeal({ id: 'm2', status: 'pending' }),
      makeMeal({ id: 'm3', status: 'pending' }),
    ]
    expect(calcNutritionScore(meals, 0)).toBe(0)
  })

  // 6. partial plate: 1 meal with only protein=true, 0 water
  //    plateScore = (1/5) = 0.2, waterScore = 0, regularityScore = min(1/3, 1) = 1/3
  //    Math.round(0.2*40 + 0*30 + (1/3)*20) = Math.round(8 + 0 + 6.666...) = Math.round(14.666...) = 15
  it('scores partial plate with protein only correctly', () => {
    const meals = [makeMeal({ hasProtein: true })]
    expect(calcNutritionScore(meals, 0)).toBe(15)
  })

  // 7. single done meal (full) + 1500ml water
  //    plateScore=1, waterScore=1, regularityScore=min(1/3, 1)=1/3
  //    Math.round(1*40 + 1*30 + (1/3)*20) = Math.round(40 + 30 + 6.666...) = Math.round(76.666...) = 77
  it('scores single full meal with 1500ml water as 77', () => {
    const meals = [
      makeMeal({ hasProtein: true, hasVegetables: true, hasCarbs: true, hasFruits: true, hadWater: true }),
    ]
    expect(calcNutritionScore(meals, 1500)).toBe(77)
  })

  // 8. 3 done meals (all full) + 1500ml → 40+30+20 = 90
  it('reaches maximum score of 90 with 3 full meals and 1500ml water', () => {
    const meals = [
      makeMeal({ id: 'm1', hasProtein: true, hasVegetables: true, hasCarbs: true, hasFruits: true, hadWater: true }),
      makeMeal({ id: 'm2', hasProtein: true, hasVegetables: true, hasCarbs: true, hasFruits: true, hadWater: true }),
      makeMeal({ id: 'm3', hasProtein: true, hasVegetables: true, hasCarbs: true, hasFruits: true, hadWater: true }),
    ]
    expect(calcNutritionScore(meals, 1500)).toBe(90)
  })

  // 9. mixed done+skipped: only done meals count
  //    2 done (full) + 1 skipped + 0 water
  //    plateScore=1, waterScore=0, regularityScore=min(2/3, 1)=2/3
  //    Math.round(1*40 + 0*30 + (2/3)*20) = Math.round(40 + 0 + 13.333...) = Math.round(53.333...) = 53
  it('counts only done meals when mixed with skipped', () => {
    const meals = [
      makeMeal({ id: 'm1', hasProtein: true, hasVegetables: true, hasCarbs: true, hasFruits: true, hadWater: true, status: 'done' }),
      makeMeal({ id: 'm2', hasProtein: true, hasVegetables: true, hasCarbs: true, hasFruits: true, hadWater: true, status: 'done' }),
      makeMeal({ id: 'm3', status: 'skipped' }),
    ]
    expect(calcNutritionScore(meals, 0)).toBe(53)
  })

  // 10. 0 meals + 1500ml water
  //     guard (!meals.length && waterMl===0) is false, so proceeds
  //     plateScore=0 (no done meals), waterScore=1, regularityScore=0
  //     Math.round(0*40 + 1*30 + 0*20) = 30
  it('scores water only when meals list is empty but water is 1500ml', () => {
    expect(calcNutritionScore([], 1500)).toBe(30)
  })
})
