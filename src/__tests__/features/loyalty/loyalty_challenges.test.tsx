import { render, screen } from '@testing-library/react'
import ChallengesPage from '@/app/(dashboard)/loyalty/challenges/page'
import { useAuth } from '@/lib/auth-context'
import { useChallenges, useChallengeProgress } from '@/lib/hooks/useChallenges'

vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/hooks/useChallenges', () => ({ useChallenges: vi.fn(), useChallengeProgress: vi.fn() }))

const mockParent = { uid: 'p1', email: 'p@test.com', name: 'Батько', role: 'parent' as const, childIds: ['c1'], individualPrice: 0, paymentCards: [] }

const challenges = [
  { id: 'ch1', title: '10 тренувань', description: 'Відвідай 10 тренувань', emoji: '🥋', type: 'individual' as const, targetValue: 10, metric: 'trainings' as const, xpReward: 100, startDate: new Date(), endDate: new Date(Date.now() + 86400000 * 7), coachId: 'c1', isActive: true },
  { id: 'ch2', title: 'Командний спринт', description: 'Разом 100 вправ', emoji: '🔥', type: 'team' as const, targetValue: 100, metric: 'exercises' as const, xpReward: 500, startDate: new Date(), endDate: new Date(Date.now() + 86400000 * 14), coachId: 'c1', isActive: true },
]

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
  vi.mocked(useChallenges).mockReturnValue({ challenges, loading: false })
  vi.mocked(useChallengeProgress).mockReturnValue({ progress: [], loading: false })
})

describe('ChallengesPage', () => {
  it('shows heading', () => {
    render(<ChallengesPage />)
    expect(screen.getByText(/Виклики/i)).toBeInTheDocument()
  })

  it('renders individual challenge', () => {
    render(<ChallengesPage />)
    expect(screen.getByText('10 тренувань')).toBeInTheDocument()
  })

  it('renders team challenge', () => {
    render(<ChallengesPage />)
    expect(screen.getByText('Командний спринт')).toBeInTheDocument()
  })

  it('shows XP reward for each challenge', () => {
    render(<ChallengesPage />)
    expect(screen.getByText('+100 XP')).toBeInTheDocument()
    expect(screen.getByText('+500 XP')).toBeInTheDocument()
  })

  it('shows "Особисті" section header', () => {
    render(<ChallengesPage />)
    expect(screen.getByText(/Особисті/i)).toBeInTheDocument()
  })

  it('shows "Командні" section header', () => {
    render(<ChallengesPage />)
    expect(screen.getByText(/Командні/i)).toBeInTheDocument()
  })

  it('shows progress percentage when progress exists', () => {
    vi.mocked(useChallengeProgress).mockReturnValue({
      progress: [{ id: 'p1', challengeId: 'ch1', childId: 'c1', currentValue: 5, completed: false }],
      loading: false,
    })
    render(<ChallengesPage />)
    expect(screen.getByText('5 / 10')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('shows completed state when challenge is done', () => {
    vi.mocked(useChallengeProgress).mockReturnValue({
      progress: [{ id: 'p1', challengeId: 'ch1', childId: 'c1', currentValue: 10, completed: true, completedAt: new Date() }],
      loading: false,
    })
    render(<ChallengesPage />)
    expect(screen.getByText(/Виконано/i)).toBeInTheDocument()
  })

  it('shows empty state when no challenges', () => {
    vi.mocked(useChallenges).mockReturnValue({ challenges: [], loading: false })
    render(<ChallengesPage />)
    expect(screen.getByText(/Активних викликів немає/i)).toBeInTheDocument()
  })

  it('shows loading skeleton when loading', () => {
    vi.mocked(useChallenges).mockReturnValue({ challenges: [], loading: true })
    const { container } = render(<ChallengesPage />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('has back link to /loyalty', () => {
    render(<ChallengesPage />)
    const links = screen.getAllByRole('link')
    expect(links.some(l => l.getAttribute('href') === '/loyalty')).toBe(true)
  })
})
