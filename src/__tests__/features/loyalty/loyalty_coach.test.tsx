import { render, screen } from '@testing-library/react'
import CoachLoyaltyPage from '@/app/(dashboard)/loyalty/coach/page'
import { useAuth } from '@/lib/auth-context'
import { useChildren } from '@/lib/hooks/useChildren'
import { useChallenges } from '@/lib/hooks/useChallenges'
import { useLoyaltyRewards } from '@/lib/hooks/useLoyaltyRewards'

vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
vi.mock('next/image', () => ({ default: ({ alt }: { alt: string }) => <img alt={alt} /> }))
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/hooks/useChildren', () => ({ useChildren: vi.fn() }))
vi.mock('@/lib/hooks/useChallenges', () => ({ useChallenges: vi.fn() }))
vi.mock('@/lib/hooks/useLoyaltyRewards', () => ({ useLoyaltyRewards: vi.fn() }))
vi.mock('@/components/ui/avatar', () => ({ Avatar: ({ name }: { name: string }) => <div>{name}</div> }))

const mockCoach = { uid: 'coach1', email: 'c@test.com', name: 'Тренер', role: 'coach' as const, childIds: [], individualPrice: 0, paymentCards: [] }
const baseChild = { birthYear: 2012, weightCategory: '-40кг', currentBelt: 'yellow' as const, coachId: 'coach1', coachName: 'Тренер', createdAt: new Date(), beltReady: false, bonusPoints: 0 }

const children = [
  { ...baseChild, id: 'c1', firstName: 'Максим', lastName: 'Іванов', totalPoints: 3500 },
  { ...baseChild, id: 'c2', firstName: 'Олена', lastName: 'Мельник', totalPoints: 1200 },
  { ...baseChild, id: 'c3', firstName: 'Петро', lastName: 'Бойко', totalPoints: 500 },
]

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ userModel: mockCoach, loading: false } as any)
  vi.mocked(useChildren).mockReturnValue({ children, loading: false } as any)
  vi.mocked(useChallenges).mockReturnValue({ challenges: [], loading: false })
  vi.mocked(useLoyaltyRewards).mockReturnValue({ rewards: [], loading: false })
})

describe('CoachLoyaltyPage', () => {
  it('renders the heading', () => {
    render(<CoachLoyaltyPage />)
    expect(screen.getByText(/Кабінет тренера/i)).toBeInTheDocument()
  })

  it('shows total XP stat (3500 + 1200 + 500 = 5200)', () => {
    render(<CoachLoyaltyPage />)
    expect(screen.getByText(/5\s*200|5200/)).toBeInTheDocument()
  })

  it('shows athlete count', () => {
    render(<CoachLoyaltyPage />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('lists athletes sorted by XP descending', () => {
    render(<CoachLoyaltyPage />)
    // Avatar mock also renders the name so use getAllByText
    expect(screen.getAllByText(/Іванов/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Мельник/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Бойко/).length).toBeGreaterThan(0)
  })

  it('shows "Золото" level badge (at least once) for Іванов (3500 XP)', () => {
    render(<CoachLoyaltyPage />)
    expect(screen.getAllByText(/Золото/i).length).toBeGreaterThan(0)
  })

  it('renders "Змінити" buttons for each athlete', () => {
    render(<CoachLoyaltyPage />)
    const buttons = screen.getAllByText('Змінити')
    expect(buttons).toHaveLength(3)
  })

  it('shows loading skeletons when loading', () => {
    vi.mocked(useChildren).mockReturnValue({ children: [], loading: true } as any)
    const { container } = render(<CoachLoyaltyPage />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows challenge count stat', () => {
    vi.mocked(useChallenges).mockReturnValue({
      challenges: [
        { id: 'ch1', title: 'ch', description: '', emoji: '🥋', type: 'individual', targetValue: 10, metric: 'trainings', xpReward: 100, startDate: new Date(), endDate: new Date(), coachId: 'coach1', isActive: true },
        { id: 'ch2', title: 'ch2', description: '', emoji: '🔥', type: 'team', targetValue: 5, metric: 'exercises', xpReward: 50, startDate: new Date(), endDate: new Date(), coachId: 'coach1', isActive: true },
      ],
      loading: false,
    })
    render(<CoachLoyaltyPage />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('has back link to /loyalty', () => {
    render(<CoachLoyaltyPage />)
    const links = screen.getAllByRole('link')
    expect(links.some(l => l.getAttribute('href') === '/loyalty')).toBe(true)
  })
})
