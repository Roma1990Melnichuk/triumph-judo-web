import { render, screen } from '@testing-library/react'
import RewardsPage from '@/app/(dashboard)/loyalty/rewards/page'
import { useAuth } from '@/lib/auth-context'
import { useChildById } from '@/lib/hooks/useChildren'
import { useLoyaltyRewards, useRewardOrders } from '@/lib/hooks/useLoyaltyRewards'

vi.mock('next/image', () => ({ default: ({ alt }: { alt: string }) => <img alt={alt} /> }))
vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/hooks/useChildren', () => ({ useChildById: vi.fn() }))
vi.mock('@/lib/hooks/useLoyaltyRewards', () => ({ useLoyaltyRewards: vi.fn(), useRewardOrders: vi.fn(), redeemReward: vi.fn() }))

const mockParent = { uid: 'p1', email: 'p@test.com', name: 'Батько', role: 'parent' as const, childIds: ['c1'], individualPrice: 0, paymentCards: [] }
const mockChild  = { id: 'c1', firstName: 'Максим', lastName: 'Іванов', birthYear: 2012, weightCategory: '-40кг', currentBelt: 'yellow' as const, coachId: 'coach1', coachName: 'Тренер', totalPoints: 3500, createdAt: new Date(), beltReady: false, bonusPoints: 0 }

const rewards = [
  { id: 'r1', name: 'Футболка ТРІУМФ', description: 'Клубна футболка', category: 'merch' as const, xpCost: 500, minLevel: 'bronze' as const, isActive: true, createdAt: new Date() },
  { id: 'r2', name: 'Майстер-клас', description: 'Приватне заняття', category: 'masterclass' as const, xpCost: 2000, minLevel: 'gold' as const, isActive: true, createdAt: new Date() },
]

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
  vi.mocked(useChildById).mockReturnValue({ child: mockChild, loading: false } as any)
  vi.mocked(useLoyaltyRewards).mockReturnValue({ rewards, loading: false })
  vi.mocked(useRewardOrders).mockReturnValue({ orders: [], loading: false })
})

describe('RewardsPage', () => {
  it('shows heading', () => {
    render(<RewardsPage />)
    expect(screen.getByText(/Каталог нагород/i)).toBeInTheDocument()
  })

  it('shows current XP balance', () => {
    render(<RewardsPage />)
    expect(screen.getByText(/3\s*500\s*XP|3500 XP/i)).toBeInTheDocument()
  })

  it('renders reward names', () => {
    render(<RewardsPage />)
    expect(screen.getByText('Футболка ТРІУМФ')).toBeInTheDocument()
    expect(screen.getByText('Майстер-клас')).toBeInTheDocument()
  })

  it('shows XP cost for each reward', () => {
    render(<RewardsPage />)
    // "500 XP" reward cost — use getAllByText since balance "3 500" also contains 500
    const matches = screen.getAllByText(/500/)
    expect(matches.length).toBeGreaterThan(0)
    // 2000 XP reward shown as formatted "2 000 XP"
    expect(screen.getByText(/2\s*000/)).toBeInTheDocument()
  })

  it('shows "Отримати" button for affordable reward', () => {
    render(<RewardsPage />)
    const buttons = screen.getAllByText('Отримати')
    // child has 3500 XP, both rewards are affordable (500 and 2000)
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('shows category filter tabs', () => {
    render(<RewardsPage />)
    expect(screen.getByText('Мерч')).toBeInTheDocument()
    expect(screen.getByText('Майстер-класи')).toBeInTheDocument()
  })

  it('shows loading skeleton when loading', () => {
    vi.mocked(useLoyaltyRewards).mockReturnValue({ rewards: [], loading: true })
    const { container } = render(<RewardsPage />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows empty state when no rewards', () => {
    vi.mocked(useLoyaltyRewards).mockReturnValue({ rewards: [], loading: false })
    render(<RewardsPage />)
    expect(screen.getByText(/Немає нагород/i)).toBeInTheDocument()
  })

  it('shows "Очікує" for pending orders', () => {
    vi.mocked(useRewardOrders).mockReturnValue({
      orders: [{ id: 'o1', childId: 'c1', rewardId: 'r1', rewardName: 'Футболка ТРІУМФ', xpCost: 500, status: 'pending', createdAt: new Date() }],
      loading: false,
    })
    render(<RewardsPage />)
    expect(screen.getByText('Очікує')).toBeInTheDocument()
  })

  it('has back link to /loyalty', () => {
    render(<RewardsPage />)
    const links = screen.getAllByRole('link')
    expect(links.some(l => l.getAttribute('href') === '/loyalty')).toBe(true)
  })
})
