import { render, screen } from '@testing-library/react'
import LoyaltyPage from '@/app/(dashboard)/loyalty/page'
import { useAuth } from '@/lib/auth-context'
import { useChildById } from '@/lib/hooks/useChildren'
import { useXPHistory } from '@/lib/hooks/useXP'
import { useChallenges, useChallengeProgress } from '@/lib/hooks/useChallenges'

vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/hooks/useChildren', () => ({ useChildById: vi.fn() }))
vi.mock('@/lib/hooks/useXP', () => ({ useXPHistory: vi.fn() }))
vi.mock('@/lib/hooks/useChallenges', () => ({ useChallenges: vi.fn(), useChallengeProgress: vi.fn() }))

const mockParent = { uid: 'p1', email: 'p@test.com', name: 'Батько', role: 'parent' as const, childIds: ['c1'], individualPrice: 0, paymentCards: [] }
const mockCoach  = { uid: 'coach1', email: 'c@test.com', name: 'Тренер', role: 'coach' as const, childIds: [], individualPrice: 0, paymentCards: [] }
const mockChild  = { id: 'c1', firstName: 'Максим', lastName: 'Іванов', birthYear: 2012, weightCategory: '-40кг', currentBelt: 'yellow' as const, coachId: 'coach1', coachName: 'Тренер', totalPoints: 2980, createdAt: new Date(), beltReady: false, bonusPoints: 0 }

beforeEach(() => {
  vi.mocked(useXPHistory).mockReturnValue({ transactions: [], loading: false })
  vi.mocked(useChallenges).mockReturnValue({ challenges: [], loading: false })
  vi.mocked(useChallengeProgress).mockReturnValue({ progress: [], loading: false })
})

describe('LoyaltyPage — coach view', () => {
  it('shows "Кабінет тренера" link for coach', () => {
    vi.mocked(useAuth).mockReturnValue({ userModel: mockCoach, loading: false } as any)
    vi.mocked(useChildById).mockReturnValue({ child: null, loading: false } as any)
    render(<LoyaltyPage />)
    expect(screen.getAllByText(/Кабінет тренера/i).length).toBeGreaterThan(0)
  })

  it('shows "Triumph Points" heading', () => {
    vi.mocked(useAuth).mockReturnValue({ userModel: mockCoach, loading: false } as any)
    vi.mocked(useChildById).mockReturnValue({ child: null, loading: false } as any)
    render(<LoyaltyPage />)
    expect(screen.getAllByText(/Triumph Points/i).length).toBeGreaterThan(0)
  })
})

describe('LoyaltyPage — parent view', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
    vi.mocked(useChildById).mockReturnValue({ child: mockChild, loading: false } as any)
  })

  it('renders loading skeleton when child is loading', () => {
    vi.mocked(useChildById).mockReturnValue({ child: null, loading: true } as any)
    const { container } = render(<LoyaltyPage />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows XP amount', () => {
    render(<LoyaltyPage />)
    expect(screen.getByText(/2\s*980\s*XP|2980 XP/i)).toBeInTheDocument()
  })

  it('shows "Срібло" level for 2980 XP (silver range 1000-2999)', () => {
    render(<LoyaltyPage />)
    expect(screen.getAllByText(/Срібло/i).length).toBeGreaterThan(0)
  })

  it('shows progress to gold level', () => {
    render(<LoyaltyPage />)
    expect(screen.getByText(/Золото/i)).toBeInTheDocument()
  })

  it('renders quick action links: history, rewards, challenges', () => {
    render(<LoyaltyPage />)
    expect(screen.getByRole('link', { name: /Історія XP/i })).toHaveAttribute('href', '/loyalty/history')
    expect(screen.getByRole('link', { name: /Каталог/i })).toHaveAttribute('href', '/loyalty/rewards')
    expect(screen.getByRole('link', { name: /Виклики/i })).toHaveAttribute('href', '/loyalty/challenges')
  })

  it('shows active challenges when present', () => {
    vi.mocked(useChallenges).mockReturnValue({
      challenges: [{
        id: 'ch1', title: '10 тренувань', description: 'desc', emoji: '🥋',
        type: 'individual', targetValue: 10, metric: 'trainings', xpReward: 100,
        startDate: new Date(), endDate: new Date(Date.now() + 86400000 * 7),
        coachId: 'coach1', isActive: true,
      }],
      loading: false,
    })
    render(<LoyaltyPage />)
    expect(screen.getByText('10 тренувань')).toBeInTheDocument()
    expect(screen.getByText('+100 XP')).toBeInTheDocument()
  })

  it('shows recent XP history when transactions exist', () => {
    vi.mocked(useXPHistory).mockReturnValue({
      transactions: [{
        id: 'tx1', childId: 'c1', amount: 10, source: 'attendance',
        description: 'Тренування присутній', createdAt: new Date(),
      }],
      loading: false,
    })
    render(<LoyaltyPage />)
    expect(screen.getByText('Тренування присутній')).toBeInTheDocument()
    expect(screen.getByText('+10 XP')).toBeInTheDocument()
  })
})

describe('LoyaltyPage — champion level', () => {
  it('shows Champion badge for 10000+ XP', () => {
    vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
    vi.mocked(useChildById).mockReturnValue({ child: { ...mockChild, totalPoints: 10000 }, loading: false } as any)
    render(<LoyaltyPage />)
    expect(screen.getAllByText(/Чемпіон/i).length).toBeGreaterThan(0)
  })
})
