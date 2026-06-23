import { describe, it, expect } from 'vitest'
import { BELT_LEVELS, BELT_DISPLAY, BELT_COLOR, BELT_ABBR } from '@/lib/constants'
import { ACHIEVEMENT_DEFS } from '@/lib/constants'

describe('BELT_LEVELS', () => {
  it('has exactly 12 levels', () => {
    expect(BELT_LEVELS).toHaveLength(12)
  })

  it('first is "white", last is "black"', () => {
    expect(BELT_LEVELS[0]).toBe('white')
    expect(BELT_LEVELS[BELT_LEVELS.length - 1]).toBe('black')
  })

  it('has no duplicate values', () => {
    const unique = new Set(BELT_LEVELS)
    expect(unique.size).toBe(BELT_LEVELS.length)
  })

  it('BELT_DISPLAY has a non-empty translation for every level', () => {
    for (const level of BELT_LEVELS) {
      expect(BELT_DISPLAY[level]).toBeTruthy()
      expect(typeof BELT_DISPLAY[level]).toBe('string')
      expect(BELT_DISPLAY[level].length).toBeGreaterThan(0)
    }
  })

  it('BELT_COLOR has a hex color (#XXXXXX) for every level', () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/
    for (const level of BELT_LEVELS) {
      expect(BELT_COLOR[level]).toMatch(hexPattern)
    }
  })

  it('BELT_ABBR has a non-empty abbreviation for every level', () => {
    for (const level of BELT_LEVELS) {
      expect(BELT_ABBR[level]).toBeTruthy()
      expect(typeof BELT_ABBR[level]).toBe('string')
      expect(BELT_ABBR[level].length).toBeGreaterThan(0)
    }
  })

  it('white belt display is "Білий"', () => {
    expect(BELT_DISPLAY.white).toBe('Білий')
  })

  it('black belt display contains "Дан" or "Чорний"', () => {
    const blackDisplay = BELT_DISPLAY.black
    expect(blackDisplay.includes('Дан') || blackDisplay.includes('Чорний')).toBe(true)
  })
})

describe('ACHIEVEMENT_DEFS', () => {
  const VALID_RARITIES = ['common', 'rare', 'epic', 'legendary', 'mythic'] as const
  const VALID_TYPES = ['auto', 'manual', 'both'] as const

  it('has at least 20 definitions', () => {
    expect(ACHIEVEMENT_DEFS.length).toBeGreaterThanOrEqual(20)
  })

  it('all ids are unique', () => {
    const ids = ACHIEVEMENT_DEFS.map((d) => d.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('all ids are non-empty', () => {
    for (const def of ACHIEVEMENT_DEFS) {
      expect(def.id).toBeTruthy()
      expect(def.id.length).toBeGreaterThan(0)
    }
  })

  it('all names are non-empty', () => {
    for (const def of ACHIEVEMENT_DEFS) {
      expect(def.name).toBeTruthy()
      expect(def.name.length).toBeGreaterThan(0)
    }
  })

  it('all emojis are non-empty', () => {
    for (const def of ACHIEVEMENT_DEFS) {
      expect(def.emoji).toBeTruthy()
      expect(def.emoji.length).toBeGreaterThan(0)
    }
  })

  it('all descriptions are non-empty', () => {
    for (const def of ACHIEVEMENT_DEFS) {
      expect(def.description).toBeTruthy()
      expect(def.description.length).toBeGreaterThan(0)
    }
  })

  it('belt category exists (some defs have category="belts")', () => {
    const beltDefs = ACHIEVEMENT_DEFS.filter((d) => d.category === 'belts')
    expect(beltDefs.length).toBeGreaterThan(0)
  })

  it('has exactly 12 belt achievements (one per belt level)', () => {
    const beltDefs = ACHIEVEMENT_DEFS.filter((d) => d.category === 'belts')
    expect(beltDefs).toHaveLength(12)
  })

  it('rarity values are only: common, rare, epic, legendary, mythic', () => {
    for (const def of ACHIEVEMENT_DEFS) {
      expect(VALID_RARITIES).toContain(def.rarity)
    }
  })

  it('type values are only: auto, manual, both', () => {
    for (const def of ACHIEVEMENT_DEFS) {
      expect(VALID_TYPES).toContain(def.type)
    }
  })
})
