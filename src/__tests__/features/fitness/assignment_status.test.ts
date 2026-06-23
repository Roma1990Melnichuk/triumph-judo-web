import { describe, it, expect } from 'vitest'
import type { FitnessAssignment } from '@/lib/hooks/useFitness'

// ---------------------------------------------------------------------------
// Pure functions under test
// ---------------------------------------------------------------------------

export function isAssignmentActive(a: FitnessAssignment, now = new Date()): boolean {
  return a.status === 'active' && a.deadline > now
}

export function isAssignmentExpired(a: FitnessAssignment, now = new Date()): boolean {
  return a.status === 'completed' || (a.status === 'active' && a.deadline <= now)
}

// Ukrainian pluralization for days
export function dayWord(n: number): string {
  const abs = Math.abs(n)
  const mod10 = abs % 10
  const mod100 = abs % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дні'
  return 'днів'
}

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const now    = new Date('2026-06-23T12:00:00Z')
const future = new Date('2026-07-01T12:00:00Z')
const past   = new Date('2026-06-01T12:00:00Z')

const makeAssignment = (overrides: Partial<FitnessAssignment> = {}): FitnessAssignment => ({
  id: 'a1',
  coachId: 'c1',
  title: 'Test',
  exerciseId: 'e1',
  exerciseName: 'Підтягування',
  exerciseUnit: 'рази',
  targetValue: 50,
  startDate: new Date('2026-06-01'),
  deadline: future,
  assignedChildIds: ['ch1'],
  status: 'active',
  coachComment: '',
  isCumulative: false,
  ...overrides,
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('isAssignmentActive', () => {
  it('1. status="active" with deadline in the future returns true', () => {
    const a = makeAssignment({ status: 'active', deadline: future })
    expect(isAssignmentActive(a, now)).toBe(true)
  })

  it('2. status="active" with deadline in the past returns false', () => {
    const a = makeAssignment({ status: 'active', deadline: past })
    expect(isAssignmentActive(a, now)).toBe(false)
  })

  it('3. status="draft" with future deadline returns false', () => {
    const a = makeAssignment({ status: 'draft', deadline: future })
    expect(isAssignmentActive(a, now)).toBe(false)
  })

  it('4. status="completed" returns false', () => {
    const a = makeAssignment({ status: 'completed', deadline: future })
    expect(isAssignmentActive(a, now)).toBe(false)
  })

  it('5. deadline exactly 2 hours in the future is still active', () => {
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    const a = makeAssignment({ status: 'active', deadline: twoHoursLater })
    expect(isAssignmentActive(a, now)).toBe(true)
  })

  it('6. deadline exactly at now returns false (not strictly greater)', () => {
    const a = makeAssignment({ status: 'active', deadline: now })
    expect(isAssignmentActive(a, now)).toBe(false)
  })
})

describe('isAssignmentExpired', () => {
  it('7. status="completed" returns true', () => {
    const a = makeAssignment({ status: 'completed', deadline: future })
    expect(isAssignmentExpired(a, now)).toBe(true)
  })

  it('8. status="active" with past deadline returns true', () => {
    const a = makeAssignment({ status: 'active', deadline: past })
    expect(isAssignmentExpired(a, now)).toBe(true)
  })

  it('9. status="active" with future deadline returns false', () => {
    const a = makeAssignment({ status: 'active', deadline: future })
    expect(isAssignmentExpired(a, now)).toBe(false)
  })

  it('10. status="draft" returns false (draft is neither active nor expired)', () => {
    const a = makeAssignment({ status: 'draft', deadline: past })
    expect(isAssignmentExpired(a, now)).toBe(false)
  })
})

describe('dayWord (Ukrainian pluralization)', () => {
  it('11. dayWord(1) → "день"', () => {
    expect(dayWord(1)).toBe('день')
  })

  it('12. dayWord(2) → "дні"', () => {
    expect(dayWord(2)).toBe('дні')
  })

  it('13. dayWord(3) → "дні"', () => {
    expect(dayWord(3)).toBe('дні')
  })

  it('14. dayWord(4) → "дні"', () => {
    expect(dayWord(4)).toBe('дні')
  })

  it('15. dayWord(5) → "днів"', () => {
    expect(dayWord(5)).toBe('днів')
  })

  it('16. dayWord(10) → "днів"', () => {
    expect(dayWord(10)).toBe('днів')
  })

  it('17. dayWord(11) → "днів" (11 is special — not "день")', () => {
    expect(dayWord(11)).toBe('днів')
  })

  it('18. dayWord(21) → "день"', () => {
    expect(dayWord(21)).toBe('день')
  })

  it('19. dayWord(22) → "дні"', () => {
    expect(dayWord(22)).toBe('дні')
  })

  it('20. dayWord(111) → "днів"', () => {
    expect(dayWord(111)).toBe('днів')
  })
})
