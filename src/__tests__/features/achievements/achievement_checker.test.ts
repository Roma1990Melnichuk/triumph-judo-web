// Achievement checker: given a belt, how many competition results, how many trainings,
// return which achievement IDs should be auto-granted

import { describe, it, expect } from 'vitest'
import { ACHIEVEMENT_DEFS, BELT_LEVELS } from '@/lib/constants'
import type { BeltLevel } from '@/lib/types'

// ── Implementation ────────────────────────────────────────────────────────────

/** Maps belt to its achievement ID */
export function beltAchievementId(belt: BeltLevel): string {
  return `belt_${belt}`
}

/**
 * Returns achievement IDs earned from a competition result.
 *
 * Grants:
 *   'first_tournament'  if place <= 6  (participated)
 *   'first_medal'       if place <= 3
 *   'champion'          if place === 1
 *   'medals_10'         if totalMedals >= 10
 *   'medals_20'         if totalMedals >= 20
 */
export function checkCompetitionAchievements(totalMedals: number, place: number): string[] {
  const ids: string[] = []
  if (place <= 6) ids.push('first_tournament')
  if (place <= 3) ids.push('first_medal')
  if (place === 1) ids.push('champion')
  if (totalMedals >= 10) ids.push('medals_10')
  if (totalMedals >= 20) ids.push('medals_20')
  return ids
}

/**
 * Returns achievement IDs earned from cumulative training count.
 *
 * Thresholds: 1, 10, 50, 100, 250, 500
 */
export function checkTrainingAchievements(count: number): string[] {
  const ids: string[] = []
  if (count >= 1)   ids.push('first_training')
  if (count >= 10)  ids.push('trainings_10')
  if (count >= 50)  ids.push('trainings_50')
  if (count >= 100) ids.push('trainings_100')
  if (count >= 250) ids.push('trainings_250')
  if (count >= 500) ids.push('trainings_500')
  return ids
}

/**
 * Returns achievement IDs earned from an attendance streak.
 *
 * Thresholds: 7, 14, 30, 100
 */
export function checkStreakAchievements(streakDays: number): string[] {
  const ids: string[] = []
  if (streakDays >= 7)   ids.push('streak_7')
  if (streakDays >= 14)  ids.push('streak_14')
  if (streakDays >= 30)  ids.push('streak_30')
  if (streakDays >= 100) ids.push('streak_100')
  return ids
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('beltAchievementId', () => {
  it('maps white belt to belt_white', () => {
    expect(beltAchievementId('white')).toBe('belt_white')
  })

  it('maps black belt to belt_black', () => {
    expect(beltAchievementId('black')).toBe('belt_black')
  })

  it('maps every belt level to belt_<beltName>', () => {
    const belts: BeltLevel[] = [
      'white', 'whiteYellow', 'yellow', 'yellowOrange',
      'orange', 'orangeGreen', 'green', 'greenBlue',
      'blue', 'blueBrown', 'brown', 'black',
    ]
    for (const belt of belts) {
      expect(beltAchievementId(belt)).toBe(`belt_${belt}`)
    }
  })
})

describe('checkCompetitionAchievements', () => {
  it('place=6, medals=0 → [first_tournament]', () => {
    expect(checkCompetitionAchievements(0, 6)).toEqual(['first_tournament'])
  })

  it('place=3, medals=0 → [first_tournament, first_medal]', () => {
    expect(checkCompetitionAchievements(0, 3)).toEqual(['first_tournament', 'first_medal'])
  })

  it('place=1, medals=0 → [first_tournament, first_medal, champion]', () => {
    expect(checkCompetitionAchievements(0, 1)).toEqual(['first_tournament', 'first_medal', 'champion'])
  })

  it('place=1, medals=1 → no medals_10 yet', () => {
    const result = checkCompetitionAchievements(1, 1)
    expect(result).not.toContain('medals_10')
    expect(result).toContain('champion')
  })

  it('medals=10, place=1 → includes medals_10', () => {
    const result = checkCompetitionAchievements(10, 1)
    expect(result).toContain('medals_10')
  })

  it('medals=20, place=1 → includes both medals_10 and medals_20', () => {
    const result = checkCompetitionAchievements(20, 1)
    expect(result).toContain('medals_10')
    expect(result).toContain('medals_20')
  })

  it('medals=9 → no medals_10', () => {
    const result = checkCompetitionAchievements(9, 1)
    expect(result).not.toContain('medals_10')
  })

  it('place=7, medals=5 → empty (no first_tournament for place > 6)', () => {
    expect(checkCompetitionAchievements(5, 7)).toEqual([])
  })
})

describe('checkTrainingAchievements', () => {
  it('count=0 → []', () => {
    expect(checkTrainingAchievements(0)).toEqual([])
  })

  it('count=1 → [first_training]', () => {
    expect(checkTrainingAchievements(1)).toEqual(['first_training'])
  })

  it('count=9 → [first_training] (no trainings_10 yet)', () => {
    expect(checkTrainingAchievements(9)).toEqual(['first_training'])
  })

  it('count=10 → [first_training, trainings_10]', () => {
    expect(checkTrainingAchievements(10)).toEqual(['first_training', 'trainings_10'])
  })

  it('count=50 → includes up through trainings_50', () => {
    const result = checkTrainingAchievements(50)
    expect(result).toContain('first_training')
    expect(result).toContain('trainings_10')
    expect(result).toContain('trainings_50')
    expect(result).not.toContain('trainings_100')
  })

  it('count=500 → all 6 achievements', () => {
    expect(checkTrainingAchievements(500)).toEqual([
      'first_training',
      'trainings_10',
      'trainings_50',
      'trainings_100',
      'trainings_250',
      'trainings_500',
    ])
  })

  it('count=100 → includes trainings_100, not trainings_250', () => {
    const result = checkTrainingAchievements(100)
    expect(result).toContain('trainings_100')
    expect(result).not.toContain('trainings_250')
  })
})

describe('checkStreakAchievements', () => {
  it('6 days → []', () => {
    expect(checkStreakAchievements(6)).toEqual([])
  })

  it('7 days → [streak_7]', () => {
    expect(checkStreakAchievements(7)).toEqual(['streak_7'])
  })

  it('13 days → [streak_7] only', () => {
    expect(checkStreakAchievements(13)).toEqual(['streak_7'])
  })

  it('14 days → [streak_7, streak_14]', () => {
    expect(checkStreakAchievements(14)).toEqual(['streak_7', 'streak_14'])
  })

  it('100 days → all 4 streak achievements (cascading)', () => {
    expect(checkStreakAchievements(100)).toEqual([
      'streak_7',
      'streak_14',
      'streak_30',
      'streak_100',
    ])
  })
})

describe('ACHIEVEMENT_DEFS integration', () => {
  const definedIds = new Set(ACHIEVEMENT_DEFS.map((def) => def.id))

  it('all IDs from checkTrainingAchievements(500) exist in ACHIEVEMENT_DEFS', () => {
    const ids = checkTrainingAchievements(500)
    for (const id of ids) {
      expect(definedIds, `expected "${id}" to be defined in ACHIEVEMENT_DEFS`).toContain(id)
    }
  })

  it('all IDs from checkStreakAchievements(100) exist in ACHIEVEMENT_DEFS', () => {
    const ids = checkStreakAchievements(100)
    for (const id of ids) {
      expect(definedIds, `expected "${id}" to be defined in ACHIEVEMENT_DEFS`).toContain(id)
    }
  })

  it('beltAchievementId for all 12 belts exist in ACHIEVEMENT_DEFS', () => {
    expect(BELT_LEVELS).toHaveLength(12)
    for (const belt of BELT_LEVELS) {
      const id = beltAchievementId(belt)
      expect(definedIds, `expected "${id}" to be defined in ACHIEVEMENT_DEFS`).toContain(id)
    }
  })
})
