import { render, screen } from '@testing-library/react'
import { HomeCalendar } from '@/components/home/HomeCalendar'
import { useAuth } from '@/lib/auth-context'
import { useGroups } from '@/lib/hooks/useGroups'

vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/hooks/useGroups', () => ({ useGroups: vi.fn() }))

const mockCoach = { uid: 'coach1', email: 'c@test.com', name: 'Андрій Бояко', role: 'coach' as const, childIds: [], individualPrice: 0, paymentCards: [] }

const mockGroup = {
  id: 'g1', coachId: 'coach1', name: 'Юніори',
  childIds: ['c1'], daysOfWeek: [1, 3, 5],
  timeStart: '18:00', timeEnd: '19:30',
}

const mockGroupSunday = {
  id: 'g2', coachId: 'coach1', name: 'Початківці',
  childIds: [], daysOfWeek: [0, 7],
  timeStart: '10:00', timeEnd: '11:30',
}

describe('HomeCalendar', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ userModel: mockCoach, loading: false } as any)
  })

  it('renders the Розклад heading', () => {
    vi.mocked(useGroups).mockReturnValue({ groups: [], loading: false } as any)
    render(<HomeCalendar />)
    expect(screen.getByText('Розклад')).toBeInTheDocument()
  })

  it('renders link to /schedule', () => {
    vi.mocked(useGroups).mockReturnValue({ groups: [], loading: false } as any)
    render(<HomeCalendar />)
    expect(screen.getByRole('link', { name: /ВСІ/i })).toHaveAttribute('href', '/schedule')
  })

  it('renders 7 day pills (Пн Вт Ср Чт Пт Сб Нд)', () => {
    vi.mocked(useGroups).mockReturnValue({ groups: [], loading: false } as any)
    render(<HomeCalendar />)
    expect(screen.getByText('Пн')).toBeInTheDocument()
    expect(screen.getByText('Вт')).toBeInTheDocument()
    expect(screen.getByText('Ср')).toBeInTheDocument()
    expect(screen.getByText('Чт')).toBeInTheDocument()
    expect(screen.getByText('Пт')).toBeInTheDocument()
    expect(screen.getByText('Сб')).toBeInTheDocument()
    expect(screen.getByText('Нд')).toBeInTheDocument()
  })

  it('shows loading skeleton while data loads', () => {
    vi.mocked(useGroups).mockReturnValue({ groups: [], loading: true } as any)
    const { container } = render(<HomeCalendar />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows "Відпочинок" when no groups match today', () => {
    vi.mocked(useGroups).mockReturnValue({ groups: [], loading: false } as any)
    render(<HomeCalendar />)
    expect(screen.getByText(/Відпочинок/i)).toBeInTheDocument()
  })

  it('renders the "Повний розклад" footer link', () => {
    vi.mocked(useGroups).mockReturnValue({ groups: [], loading: false } as any)
    render(<HomeCalendar />)
    expect(screen.getByText(/Повний розклад/i)).toBeInTheDocument()
  })

  it('shows group name when group is scheduled for today', () => {
    const allDaysGroup = { ...mockGroup, daysOfWeek: [0,1,2,3,4,5,6,7] }
    vi.mocked(useGroups).mockReturnValue({ groups: [allDaysGroup], loading: false } as any)
    render(<HomeCalendar />)
    expect(screen.getByText('Юніори')).toBeInTheDocument()
  })

  it('shows training time when group is scheduled for today', () => {
    const allDaysGroup = { ...mockGroup, daysOfWeek: [0,1,2,3,4,5,6,7] }
    vi.mocked(useGroups).mockReturnValue({ groups: [allDaysGroup], loading: false } as any)
    render(<HomeCalendar />)
    expect(screen.getByText(/18:00.*19:30/)).toBeInTheDocument()
  })
})
