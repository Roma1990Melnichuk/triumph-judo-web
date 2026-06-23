import { describe, it, expect } from 'vitest'
import { getAssignmentProgress } from '../../../lib/hooks/useFitness'

interface FitnessLog {
  id: string
  childId: string
  exerciseId: string
  exerciseName: string
  exerciseUnit: string
  date: Date
  value: number
  comment: string
  difficulty: 1 | 2 | 3
  assignmentId?: string
}

interface FitnessAssignment {
  id: string
  coachId: string
  title: string
  exerciseId: string
  exerciseName: string
  exerciseUnit: string
  targetValue: number
  startDate: Date
  deadline: Date
  assignedChildIds: string[]
  status: 'active' | 'draft' | 'completed'
  coachComment: string
  isCumulative: boolean
}

const makeAssignment = (overrides = {}): FitnessAssignment => ({
  id: 'a1',
  coachId: 'coach1',
  title: 'Test',
  exerciseId: 'e1',
  exerciseName: 'Підтягування',
  exerciseUnit: 'рази',
  targetValue: 100,
  startDate: new Date(),
  deadline: new Date(Date.now() + 86400000),
  assignedChildIds: ['c1'],
  status: 'active',
  coachComment: '',
  isCumulative: false,
  ...overrides,
})

const makeLog = (overrides = {}): FitnessLog => ({
  id: 'l1',
  childId: 'c1',
  exerciseId: 'e1',
  exerciseName: 'Підтягування',
  exerciseUnit: 'рази',
  date: new Date(),
  value: 50,
  comment: '',
  difficulty: 1,
  assignmentId: 'a1',
  ...overrides,
})

describe('getAssignmentProgress', () => {
  it('returns 0 when there are no logs', () => {
    const assignment = makeAssignment()
    expect(getAssignmentProgress([], assignment, 'c1')).toBe(0)
  })

  it('non-cumulative: single log 50/100 returns 50', () => {
    const assignment = makeAssignment({ isCumulative: false, targetValue: 100 })
    const logs = [makeLog({ value: 50 })]
    expect(getAssignmentProgress(logs, assignment, 'c1')).toBe(50)
  })

  it('non-cumulative: best of [30, 70, 50] returns 70', () => {
    const assignment = makeAssignment({ isCumulative: false, targetValue: 100 })
    const logs = [
      makeLog({ id: 'l1', value: 30 }),
      makeLog({ id: 'l2', value: 70 }),
      makeLog({ id: 'l3', value: 50 }),
    ]
    expect(getAssignmentProgress(logs, assignment, 'c1')).toBe(70)
  })

  it('non-cumulative: 100/100 returns 100', () => {
    const assignment = makeAssignment({ isCumulative: false, targetValue: 100 })
    const logs = [makeLog({ value: 100 })]
    expect(getAssignmentProgress(logs, assignment, 'c1')).toBe(100)
  })

  it('non-cumulative: overachievement 150/100 is clamped to 100', () => {
    const assignment = makeAssignment({ isCumulative: false, targetValue: 100 })
    const logs = [makeLog({ value: 150 })]
    expect(getAssignmentProgress(logs, assignment, 'c1')).toBe(100)
  })

  it('cumulative: single log 50/100 returns 50', () => {
    const assignment = makeAssignment({ isCumulative: true, targetValue: 100 })
    const logs = [makeLog({ value: 50 })]
    expect(getAssignmentProgress(logs, assignment, 'c1')).toBe(50)
  })

  it('cumulative: sum [30, 40] / 100 returns 70', () => {
    const assignment = makeAssignment({ isCumulative: true, targetValue: 100 })
    const logs = [
      makeLog({ id: 'l1', value: 30 }),
      makeLog({ id: 'l2', value: 40 }),
    ]
    expect(getAssignmentProgress(logs, assignment, 'c1')).toBe(70)
  })

  it('cumulative: sum [60, 60] / 100 is clamped to 100', () => {
    const assignment = makeAssignment({ isCumulative: true, targetValue: 100 })
    const logs = [
      makeLog({ id: 'l1', value: 60 }),
      makeLog({ id: 'l2', value: 60 }),
    ]
    expect(getAssignmentProgress(logs, assignment, 'c1')).toBe(100)
  })

  it('cumulative: sum [150] / 100 is clamped to 100', () => {
    const assignment = makeAssignment({ isCumulative: true, targetValue: 100 })
    const logs = [makeLog({ value: 150 })]
    expect(getAssignmentProgress(logs, assignment, 'c1')).toBe(100)
  })

  it('child isolation: logs for childId c2 are excluded when querying for c1', () => {
    const assignment = makeAssignment({ isCumulative: false, targetValue: 100 })
    const logs = [
      makeLog({ id: 'l1', childId: 'c2', value: 80 }),
      makeLog({ id: 'l2', childId: 'c2', value: 90 }),
    ]
    expect(getAssignmentProgress(logs, assignment, 'c1')).toBe(0)
  })

  it('assignment isolation: logs with different assignmentId are excluded', () => {
    const assignment = makeAssignment({ isCumulative: false, targetValue: 100 })
    const logs = [
      makeLog({ id: 'l1', assignmentId: 'a2', value: 80 }),
      makeLog({ id: 'l2', assignmentId: 'a3', value: 90 }),
    ]
    expect(getAssignmentProgress(logs, assignment, 'c1')).toBe(0)
  })

  it('empty assignmentId in log is excluded (undefined !== a1)', () => {
    const assignment = makeAssignment({ isCumulative: false, targetValue: 100 })
    const logWithoutAssignment = makeLog({ value: 80 })
    delete (logWithoutAssignment as Partial<FitnessLog>).assignmentId
    expect(getAssignmentProgress([logWithoutAssignment], assignment, 'c1')).toBe(0)
  })
})
