import { describe, it, expect } from 'vitest'

// ---------------------------------------------------------------------------
// Type (mirrors src/lib/types.ts — inlined so the file has no external deps)
// ---------------------------------------------------------------------------

interface MembershipModel {
  id: string
  childId: string
  parentId: string
  tariffId: string
  tariffName: string
  startDate: Date
  endDate: Date
  status: 'active' | 'expired' | 'pending' | 'cancelled'
  amountPaid: number
  paidAt?: Date
  notes?: string
}

// ---------------------------------------------------------------------------
// Pure-function helpers under test
// ---------------------------------------------------------------------------

function isActive(m: MembershipModel, now = new Date()): boolean {
  return m.status === 'active' && m.endDate > now
}

function isExpired(m: MembershipModel, now = new Date()): boolean {
  return (m.status === 'active' && m.endDate < now) || m.status === 'expired'
}

function isExpiringSoon(m: MembershipModel, now = new Date()): boolean {
  if (!isActive(m, now)) return false
  const diff = (m.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff <= 7
}

function daysRemaining(m: MembershipModel, now = new Date()): number {
  if (!isActive(m, now)) return 0
  return Math.max(0, Math.ceil((m.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}

function membershipStatus(
  m: MembershipModel,
  now = new Date(),
): 'active' | 'expiringSoon' | 'expired' {
  if (isExpiringSoon(m, now)) return 'expiringSoon'
  if (isActive(m, now)) return 'active'
  return 'expired'
}

// ---------------------------------------------------------------------------
// Test helpers — fixed "now" for determinism
// ---------------------------------------------------------------------------

const now = new Date('2026-06-23T12:00:00Z')

const makeActive = (): MembershipModel => ({
  id: 'm1',
  childId: 'c1',
  parentId: 'p1',
  tariffId: 't1',
  tariffName: 'Місяць',
  startDate: new Date('2026-06-01'),
  endDate: new Date('2026-07-01'),
  status: 'active',
  amountPaid: 1200,
})

const makeExpiringSoon = (): MembershipModel => ({
  ...makeActive(),
  endDate: new Date('2026-06-27T12:00:00Z'), // 4 days from now
})

const makeExpired = (): MembershipModel => ({
  ...makeActive(),
  endDate: new Date('2026-06-10'), // past
  status: 'expired',
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('isActive', () => {
  it('1. active status with future endDate returns true', () => {
    expect(isActive(makeActive(), now)).toBe(true)
  })

  it('2. active status with past endDate returns false', () => {
    const m: MembershipModel = { ...makeActive(), endDate: new Date('2026-06-10') }
    expect(isActive(m, now)).toBe(false)
  })

  it('3. expired status returns false', () => {
    expect(isActive(makeExpired(), now)).toBe(false)
  })

  it('4. cancelled status returns false', () => {
    const m: MembershipModel = { ...makeActive(), status: 'cancelled' }
    expect(isActive(m, now)).toBe(false)
  })
})

describe('isExpired', () => {
  it('5. status=expired returns true', () => {
    expect(isExpired(makeExpired(), now)).toBe(true)
  })

  it('6. active status with past endDate returns true', () => {
    const m: MembershipModel = {
      ...makeActive(),
      endDate: new Date('2026-06-10'),
      // status stays 'active' — data lag scenario
    }
    expect(isExpired(m, now)).toBe(true)
  })

  it('7. active status with future endDate returns false', () => {
    expect(isExpired(makeActive(), now)).toBe(false)
  })
})

describe('isExpiringSoon', () => {
  it('8. 4 days remaining returns true', () => {
    expect(isExpiringSoon(makeExpiringSoon(), now)).toBe(true)
  })

  it('9. exactly 7 days remaining returns true (boundary)', () => {
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const m: MembershipModel = { ...makeActive(), endDate: sevenDaysLater }
    expect(isExpiringSoon(m, now)).toBe(true)
  })

  it('10. 8 days remaining returns false', () => {
    const eightDaysLater = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000)
    const m: MembershipModel = { ...makeActive(), endDate: eightDaysLater }
    expect(isExpiringSoon(m, now)).toBe(false)
  })

  it('11. expired membership returns false', () => {
    expect(isExpiringSoon(makeExpired(), now)).toBe(false)
  })
})

describe('daysRemaining', () => {
  it('12. active membership 8 days out returns 8', () => {
    const eightDaysLater = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000)
    const m: MembershipModel = { ...makeActive(), endDate: eightDaysLater }
    expect(daysRemaining(m, now)).toBe(8)
  })

  it('13. expired membership returns 0', () => {
    expect(daysRemaining(makeExpired(), now)).toBe(0)
  })

  it('14. active membership 1 day out returns 1', () => {
    const oneDayLater = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
    const m: MembershipModel = { ...makeActive(), endDate: oneDayLater }
    expect(daysRemaining(m, now)).toBe(1)
  })
})

describe('membershipStatus', () => {
  it('15. 4 days remaining returns expiringSoon', () => {
    expect(membershipStatus(makeExpiringSoon(), now)).toBe('expiringSoon')
  })

  it('16. 30 days remaining returns active', () => {
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const m: MembershipModel = { ...makeActive(), endDate: thirtyDaysLater }
    expect(membershipStatus(m, now)).toBe('active')
  })

  it('17. expired membership returns expired', () => {
    expect(membershipStatus(makeExpired(), now)).toBe('expired')
  })

  it('18. expiringSoon takes priority over active', () => {
    // A membership within 7 days must return expiringSoon, not active
    const sixDaysLater = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000)
    const m: MembershipModel = { ...makeActive(), endDate: sixDaysLater }
    const result = membershipStatus(m, now)
    expect(result).toBe('expiringSoon')
    expect(result).not.toBe('active')
  })
})
