import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatDateShort,
  dateKey,
  getAge,
  getAgeCategory,
  displayWeight,
  avatarColor,
} from '@/lib/utils'

// All date-based tests use a fixed date to avoid flakiness.
// getAge / getAgeCategory use the current year (2026) for expected values.
const CURRENT_YEAR = 2026

// ---------------------------------------------------------------------------
// dateKey
// ---------------------------------------------------------------------------
describe('dateKey', () => {
  it('formats a mid-year date as YYYY-MM-DD', () => {
    expect(dateKey(new Date('2026-06-23T00:00:00'))).toBe('2026-06-23')
  })

  it('pads single-digit month and day with zeros', () => {
    expect(dateKey(new Date('2026-01-05T00:00:00'))).toBe('2026-01-05')
  })

  it('handles December (month 12)', () => {
    expect(dateKey(new Date('2025-12-31T00:00:00'))).toBe('2025-12-31')
  })

  it('handles February 1st', () => {
    expect(dateKey(new Date('2024-02-01T00:00:00'))).toBe('2024-02-01')
  })
})

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------
describe('formatDate', () => {
  it('returns a long Ukrainian date string for 23 June 2026', () => {
    const result = formatDate(new Date('2026-06-23T12:00:00'))
    // The locale formats this as "23 червня 2026 р."
    expect(result).toMatch(/23/)
    expect(result).toMatch(/2026/)
    expect(result).toMatch(/червн/)
  })

  it('returns a long Ukrainian date string for 1 January 2025', () => {
    const result = formatDate(new Date('2025-01-01T12:00:00'))
    expect(result).toMatch(/1/)
    expect(result).toMatch(/2025/)
    expect(result).toMatch(/січн/)
  })

  it('returns a string (not undefined/null)', () => {
    expect(typeof formatDate(new Date('2026-06-23T00:00:00'))).toBe('string')
  })
})

// ---------------------------------------------------------------------------
// formatDateShort
// ---------------------------------------------------------------------------
describe('formatDateShort', () => {
  it('returns a short Ukrainian date string for 23 June', () => {
    const result = formatDateShort(new Date('2026-06-23T12:00:00'))
    expect(result).toMatch(/23/)
    expect(result).toMatch(/черв/)
  })

  it('does not include the year', () => {
    const result = formatDateShort(new Date('2026-06-23T12:00:00'))
    expect(result).not.toMatch(/2026/)
  })

  it('returns a short Ukrainian date string for 1 March', () => {
    const result = formatDateShort(new Date('2026-03-01T12:00:00'))
    expect(result).toMatch(/1/)
    expect(result).toMatch(/бер/)
  })
})

// ---------------------------------------------------------------------------
// getAge
// ---------------------------------------------------------------------------
describe('getAge', () => {
  it('returns 0 for a birth year equal to the current year', () => {
    expect(getAge(CURRENT_YEAR)).toBe(0)
  })

  it('returns the correct age for a past birth year', () => {
    expect(getAge(2000)).toBe(CURRENT_YEAR - 2000) // 26
  })

  it('returns 1 for birth year one less than current year', () => {
    expect(getAge(CURRENT_YEAR - 1)).toBe(1)
  })

  it('returns a large age for a distant past birth year', () => {
    expect(getAge(1960)).toBe(CURRENT_YEAR - 1960) // 66
  })
})

// ---------------------------------------------------------------------------
// getAgeCategory  (all ages computed relative to CURRENT_YEAR = 2026)
// ---------------------------------------------------------------------------
describe('getAgeCategory', () => {
  // age <= 8  → 'Малюки'
  it('returns Малюки for age 8 (birth year 2018)', () => {
    expect(getAgeCategory(CURRENT_YEAR - 8)).toBe('Малюки')
  })

  it('returns Малюки for age 5', () => {
    expect(getAgeCategory(CURRENT_YEAR - 5)).toBe('Малюки')
  })

  // age <= 10 → 'Міні'
  it('returns Міні for age 9', () => {
    expect(getAgeCategory(CURRENT_YEAR - 9)).toBe('Міні')
  })

  it('returns Міні for age 10', () => {
    expect(getAgeCategory(CURRENT_YEAR - 10)).toBe('Міні')
  })

  // age <= 12 → 'Юніори мол.'
  it('returns Юніори мол. for age 11', () => {
    expect(getAgeCategory(CURRENT_YEAR - 11)).toBe('Юніори мол.')
  })

  it('returns Юніори мол. for age 12', () => {
    expect(getAgeCategory(CURRENT_YEAR - 12)).toBe('Юніори мол.')
  })

  // age <= 14 → 'Кадети'
  it('returns Кадети for age 13', () => {
    expect(getAgeCategory(CURRENT_YEAR - 13)).toBe('Кадети')
  })

  it('returns Кадети for age 14', () => {
    expect(getAgeCategory(CURRENT_YEAR - 14)).toBe('Кадети')
  })

  // age <= 17 → 'Юніори'
  it('returns Юніори for age 15', () => {
    expect(getAgeCategory(CURRENT_YEAR - 15)).toBe('Юніори')
  })

  it('returns Юніори for age 17', () => {
    expect(getAgeCategory(CURRENT_YEAR - 17)).toBe('Юніори')
  })

  // age <= 20 → 'Молодь'
  it('returns Молодь for age 18', () => {
    expect(getAgeCategory(CURRENT_YEAR - 18)).toBe('Молодь')
  })

  it('returns Молодь for age 20', () => {
    expect(getAgeCategory(CURRENT_YEAR - 20)).toBe('Молодь')
  })

  // else → 'Дорослі'
  it('returns Дорослі for age 21', () => {
    expect(getAgeCategory(CURRENT_YEAR - 21)).toBe('Дорослі')
  })

  it('returns Дорослі for age 40', () => {
    expect(getAgeCategory(CURRENT_YEAR - 40)).toBe('Дорослі')
  })
})

// ---------------------------------------------------------------------------
// displayWeight
// ---------------------------------------------------------------------------
describe('displayWeight', () => {
  it('strips a leading minus sign from weight strings', () => {
    expect(displayWeight('-55кг')).toBe('55кг')
  })

  it('preserves a leading plus sign', () => {
    expect(displayWeight('+100кг')).toBe('+100кг')
  })

  it('leaves a weight string with no prefix unchanged', () => {
    expect(displayWeight('73кг')).toBe('73кг')
  })

  it('strips minus from another weight', () => {
    expect(displayWeight('-66кг')).toBe('66кг')
  })

  it('handles an empty string without throwing', () => {
    expect(displayWeight('')).toBe('')
  })
})

// ---------------------------------------------------------------------------
// avatarColor
// ---------------------------------------------------------------------------
describe('avatarColor', () => {
  const VALID_COLORS = ['#D32F2F', '#7B1FA2', '#1565C0', '#2E7D32', '#EF6C00', '#00838F']

  it('returns a value from the allowed color palette', () => {
    expect(VALID_COLORS).toContain(avatarColor('Alice'))
  })

  it('returns a value from the palette for an empty string', () => {
    expect(VALID_COLORS).toContain(avatarColor(''))
  })

  it('is deterministic — same seed always yields the same color', () => {
    expect(avatarColor('TestSeed')).toBe(avatarColor('TestSeed'))
  })

  it('returns different colors for seeds that map to different palette indices', () => {
    // Brute-force two seeds that actually produce different indices.
    const seen = new Set<string>()
    const seeds = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    for (const s of seeds) seen.add(avatarColor(s))
    expect(seen.size).toBeGreaterThan(1)
  })

  it('returns a hex color string starting with #', () => {
    expect(avatarColor('judo')).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })
})
