import { getLoyaltyLevel, getLoyaltyProgress, LOYALTY_LEVELS } from '@/lib/constants'

describe('getLoyaltyLevel', () => {
  it('returns bronze for 0 XP', () => {
    expect(getLoyaltyLevel(0)).toBe('bronze')
  })
  it('returns bronze for 999 XP', () => {
    expect(getLoyaltyLevel(999)).toBe('bronze')
  })
  it('returns silver for 1000 XP', () => {
    expect(getLoyaltyLevel(1000)).toBe('silver')
  })
  it('returns silver for 2999 XP', () => {
    expect(getLoyaltyLevel(2999)).toBe('silver')
  })
  it('returns gold for 3000 XP', () => {
    expect(getLoyaltyLevel(3000)).toBe('gold')
  })
  it('returns gold for 9999 XP', () => {
    expect(getLoyaltyLevel(9999)).toBe('gold')
  })
  it('returns champion for 10000 XP', () => {
    expect(getLoyaltyLevel(10000)).toBe('champion')
  })
  it('returns champion for 50000 XP', () => {
    expect(getLoyaltyLevel(50000)).toBe('champion')
  })
})

describe('getLoyaltyProgress', () => {
  it('bronze at 0: pct=0, next=1000', () => {
    const { level, pct, next } = getLoyaltyProgress(0)
    expect(level).toBe('bronze')
    expect(pct).toBe(0)
    expect(next).toBe(1000)
  })

  it('bronze at 500: pct=50', () => {
    const { pct } = getLoyaltyProgress(500)
    expect(pct).toBe(50)
  })

  it('bronze at 999: pct=100 (999/1000 rounds to 100)', () => {
    const { pct } = getLoyaltyProgress(999)
    expect(pct).toBe(100)
  })

  it('silver at 1000: pct=0, next=3000', () => {
    const { level, pct, next } = getLoyaltyProgress(1000)
    expect(level).toBe('silver')
    expect(pct).toBe(0)
    expect(next).toBe(3000)
  })

  it('silver at 2000: pct=50', () => {
    const { pct } = getLoyaltyProgress(2000)
    expect(pct).toBe(50)
  })

  it('gold at 3000: pct=0, next=10000', () => {
    const { level, pct, next } = getLoyaltyProgress(3000)
    expect(level).toBe('gold')
    expect(pct).toBe(0)
    expect(next).toBe(10000)
  })

  it('champion has pct=100 and next=null', () => {
    const { level, pct, next } = getLoyaltyProgress(10000)
    expect(level).toBe('champion')
    expect(pct).toBe(100)
    expect(next).toBeNull()
  })

  it('all levels defined in LOYALTY_LEVELS', () => {
    expect(Object.keys(LOYALTY_LEVELS)).toEqual(['bronze', 'silver', 'gold', 'champion'])
  })
})
