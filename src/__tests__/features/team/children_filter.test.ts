import { describe, it, expect } from 'vitest'
import type { ChildModel } from '@/lib/types'

// ── Filter definition ─────────────────────────────────────────────────────────

interface ChildFilter {
  search?: string      // case-insensitive partial match on firstName or lastName
  belt?: string        // exact match on currentBelt
  coachId?: string     // exact match
  birthYear?: number   // exact match
  sortBy?: 'points' | 'name'  // default 'points' desc; 'name' = lastName asc
}

export function filterChildren(children: ChildModel[], filter: ChildFilter): ChildModel[] {
  let result = [...children]

  if (filter.search) {
    const q = filter.search.toLowerCase()
    result = result.filter(c =>
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q)
    )
  }
  if (filter.belt) {
    result = result.filter(c => c.currentBelt === filter.belt)
  }
  if (filter.coachId) {
    result = result.filter(c => c.coachId === filter.coachId)
  }
  if (filter.birthYear) {
    result = result.filter(c => c.birthYear === filter.birthYear)
  }

  // Sort
  if (filter.sortBy === 'name') {
    result.sort((a, b) => a.lastName.localeCompare(b.lastName, 'uk'))
  } else {
    // default: totalPoints DESC, then lastName ASC
    result.sort((a, b) =>
      b.totalPoints - a.totalPoints || a.lastName.localeCompare(b.lastName, 'uk')
    )
  }

  return result
}

// ── Test data ─────────────────────────────────────────────────────────────────

const makeChild = (overrides: Partial<ChildModel>): ChildModel => ({
  id: 'c1', firstName: 'Іван', lastName: 'Коваль', birthYear: 2012,
  weightCategory: '-40кг', currentBelt: 'white', coachId: 'coach1',
  totalPoints: 100, createdAt: new Date(), beltReady: false, bonusPoints: 0,
  coachName: 'Тренер', ...overrides,
})

const children: ChildModel[] = [
  makeChild({ id: 'c1', firstName: 'Іван',   lastName: 'Коваль',   birthYear: 2012, currentBelt: 'white',  coachId: 'coach1', totalPoints: 150 }),
  makeChild({ id: 'c2', firstName: 'Олена',  lastName: 'Мельник',  birthYear: 2013, currentBelt: 'yellow', coachId: 'coach1', totalPoints: 200 }),
  makeChild({ id: 'c3', firstName: 'Петро',  lastName: 'Бойко',    birthYear: 2012, currentBelt: 'white',  coachId: 'coach2', totalPoints: 80  }),
  makeChild({ id: 'c4', firstName: 'Марія',  lastName: 'Ткаченко', birthYear: 2014, currentBelt: 'orange', coachId: 'coach1', totalPoints: 300 }),
  makeChild({ id: 'c5', firstName: 'Андрій', lastName: 'Іваненко', birthYear: 2013, currentBelt: 'yellow', coachId: 'coach2', totalPoints: 120 }),
  makeChild({ id: 'c6', firstName: "Соф'я",  lastName: 'Власенко', birthYear: 2015, currentBelt: 'white',  coachId: 'coach1', totalPoints: 90  }),
]

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('no filter', () => {
  it('returns all 6 children', () => {
    const result = filterChildren(children, {})
    expect(result).toHaveLength(6)
  })

  it('sorted by totalPoints desc: 300, 200, 150, 120, 90, 80', () => {
    const result = filterChildren(children, {})
    const points = result.map(c => c.totalPoints)
    expect(points).toEqual([300, 200, 150, 120, 90, 80])
  })
})

describe('search', () => {
  it('"іван" matches Іван and Іваненко — 2 results', () => {
    const result = filterChildren(children, { search: 'іван' })
    expect(result).toHaveLength(2)
    const ids = result.map(c => c.id)
    expect(ids).toContain('c1')
    expect(ids).toContain('c5')
  })

  it('"коваль" matches Коваль — 1 result', () => {
    const result = filterChildren(children, { search: 'коваль' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c1')
  })

  it('"xyz" — 0 results', () => {
    const result = filterChildren(children, { search: 'xyz' })
    expect(result).toHaveLength(0)
  })

  it('empty string — all 6', () => {
    const result = filterChildren(children, { search: '' })
    expect(result).toHaveLength(6)
  })

  it('uppercase "ОЛЕНА" matches Олена — 1 result', () => {
    const result = filterChildren(children, { search: 'ОЛЕНА' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c2')
  })
})

describe('belt filter', () => {
  it('"white" — 3 children (c1, c3, c6)', () => {
    const result = filterChildren(children, { belt: 'white' })
    expect(result).toHaveLength(3)
    const ids = result.map(c => c.id).sort()
    expect(ids).toEqual(['c1', 'c3', 'c6'])
  })

  it('"yellow" — 2 children (c2, c5)', () => {
    const result = filterChildren(children, { belt: 'yellow' })
    expect(result).toHaveLength(2)
    const ids = result.map(c => c.id).sort()
    expect(ids).toEqual(['c2', 'c5'])
  })

  it('"black" — 0 children', () => {
    const result = filterChildren(children, { belt: 'black' })
    expect(result).toHaveLength(0)
  })
})

describe('coachId filter', () => {
  it('"coach1" — 4 children (c1, c2, c4, c6)', () => {
    const result = filterChildren(children, { coachId: 'coach1' })
    expect(result).toHaveLength(4)
    const ids = result.map(c => c.id).sort()
    expect(ids).toEqual(['c1', 'c2', 'c4', 'c6'])
  })

  it('"coach2" — 2 children (c3, c5)', () => {
    const result = filterChildren(children, { coachId: 'coach2' })
    expect(result).toHaveLength(2)
    const ids = result.map(c => c.id).sort()
    expect(ids).toEqual(['c3', 'c5'])
  })
})

describe('birthYear filter', () => {
  it('2012 — 2 children (c1, c3)', () => {
    const result = filterChildren(children, { birthYear: 2012 })
    expect(result).toHaveLength(2)
    const ids = result.map(c => c.id).sort()
    expect(ids).toEqual(['c1', 'c3'])
  })

  it('2015 — 1 child (c6)', () => {
    const result = filterChildren(children, { birthYear: 2015 })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c6')
  })

  it('2000 — 0 children', () => {
    const result = filterChildren(children, { birthYear: 2000 })
    expect(result).toHaveLength(0)
  })
})

describe('combined filters', () => {
  it('belt="white" + coachId="coach1" — c1, c6 (2 children)', () => {
    const result = filterChildren(children, { belt: 'white', coachId: 'coach1' })
    expect(result).toHaveLength(2)
    const ids = result.map(c => c.id).sort()
    expect(ids).toEqual(['c1', 'c6'])
  })

  it('search="а" + belt="yellow" — Олена, Андрій (2 children)', () => {
    // search='а' matches: Іван (firstName), Олена (firstName), Марія (firstName),
    // Андрій (firstName), Соф'я (firstName), Іваненко (lastName)
    // after belt='yellow': Олена (c2) and Андрій (c5)
    const result = filterChildren(children, { search: 'а', belt: 'yellow' })
    expect(result).toHaveLength(2)
    const ids = result.map(c => c.id).sort()
    expect(ids).toEqual(['c2', 'c5'])
  })

  it('birthYear=2013 + coachId="coach1" — Олена only (c2)', () => {
    const result = filterChildren(children, { birthYear: 2013, coachId: 'coach1' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c2')
  })
})

describe('sorting', () => {
  it('default (no filter): first child is Марія (300 pts)', () => {
    const result = filterChildren(children, {})
    expect(result[0].id).toBe('c4')
    expect(result[0].totalPoints).toBe(300)
  })

  it('sortBy="name": sorted by lastName asc, first is Бойко (Петро)', () => {
    const result = filterChildren(children, { sortBy: 'name' })
    expect(result[0].lastName).toBe('Бойко')
    expect(result[0].id).toBe('c3')
  })

  it('equal points: tiebreaker is lastName asc', () => {
    const tied: ChildModel[] = [
      makeChild({ id: 't1', firstName: 'А', lastName: 'Яценко',  totalPoints: 50 }),
      makeChild({ id: 't2', firstName: 'Б', lastName: 'Авраменко', totalPoints: 50 }),
    ]
    const result = filterChildren(tied, {})
    expect(result[0].id).toBe('t2')  // Авраменко < Яценко
    expect(result[1].id).toBe('t1')
  })
})
