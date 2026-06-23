import { render, screen } from '@testing-library/react'
import { HomeProfileCard } from '@/components/home/HomeProfileCard'
import { useAuth } from '@/lib/auth-context'
import { useChildById } from '@/lib/hooks/useChildren'
import { useChildAchievements } from '@/lib/hooks/useAchievements'

vi.mock('next/image', () => ({ default: ({ alt }: { alt: string }) => <img alt={alt} /> }))
vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/hooks/useChildren', () => ({ useChildById: vi.fn() }))
vi.mock('@/lib/hooks/useAchievements', () => ({ useChildAchievements: vi.fn() }))

const mockParent = { uid: 'p1', email: 'p@test.com', name: 'Батько', role: 'parent' as const, childIds: ['c1'], individualPrice: 0, paymentCards: [] }
const mockCoach  = { uid: 'coach1', email: 'c@test.com', name: 'Андрій Бояко', role: 'coach' as const, childIds: [], individualPrice: 0, paymentCards: [] }
const mockChild  = { id: 'c1', firstName: 'Максим', lastName: 'Іванов', birthYear: 2012, weightCategory: '-40кг', currentBelt: 'yellow' as const, coachId: 'coach1', coachName: 'Тренер', totalPoints: 750, createdAt: new Date(), beltReady: false, bonusPoints: 0 }

describe('HomeProfileCard', () => {
  beforeEach(() => {
    vi.mocked(useChildAchievements).mockReturnValue({ earned: [], loading: false })
  })

  describe('loading state', () => {
    it('renders a loading skeleton when child is loading', () => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
      vi.mocked(useChildById).mockReturnValue({ child: null, loading: true } as any)
      const { container } = render(<HomeProfileCard />)
      // Skeleton has animate-pulse class
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })

  describe('coach view (no child)', () => {
    it('renders coach name when user is a coach with no children', () => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockCoach, loading: false } as any)
      vi.mocked(useChildById).mockReturnValue({ child: null, loading: false } as any)
      render(<HomeProfileCard />)
      expect(screen.getByText('Андрій Бояко')).toBeInTheDocument()
    })

    it('shows "Тренер" label in coach view', () => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockCoach, loading: false } as any)
      vi.mocked(useChildById).mockReturnValue({ child: null, loading: false } as any)
      render(<HomeProfileCard />)
      expect(screen.getByText(/Тренер/i)).toBeInTheDocument()
    })
  })

  describe('parent view with child', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
      vi.mocked(useChildById).mockReturnValue({ child: mockChild, loading: false } as any)
    })

    it('renders child first name', () => {
      render(<HomeProfileCard />)
      // Name is split across two text nodes by a <br/>, use regex
      expect(screen.getByText(/Максим/)).toBeInTheDocument()
    })

    it('renders child last name', () => {
      render(<HomeProfileCard />)
      expect(screen.getByText(/Іванов/)).toBeInTheDocument()
    })

    it('renders profile link pointing to /team', () => {
      render(<HomeProfileCard />)
      expect(screen.getByRole('link', { name: /Відкрити профіль/i })).toHaveAttribute('href', '/team')
    })

    it('shows achievement count when achievements exist', () => {
      vi.mocked(useChildAchievements).mockReturnValue({ earned: [
        { childId: 'c1', achievementId: 'belt_white', earnedAt: new Date() },
        { childId: 'c1', achievementId: 'first_training', earnedAt: new Date() },
      ], loading: false } as any)
      render(<HomeProfileCard />)
      expect(screen.getByText(/2 досягнень/i)).toBeInTheDocument()
    })

    it('does not show achievement block when earned count is 0', () => {
      vi.mocked(useChildAchievements).mockReturnValue({ earned: [], loading: false } as any)
      render(<HomeProfileCard />)
      expect(screen.queryByText(/досягнень/i)).not.toBeInTheDocument()
    })
  })

  describe('progress percentage', () => {
    it('shows "прогрес" label for the progress ring', () => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
      vi.mocked(useChildById).mockReturnValue({ child: { ...mockChild, totalPoints: 750 }, loading: false } as any)
      render(<HomeProfileCard />)
      // 750 % 1000 = 750 → Math.round(750/10) = 75%
      expect(screen.getByText('75%')).toBeInTheDocument()
      expect(screen.getByText('прогрес')).toBeInTheDocument()
    })

    it('shows 0% when totalPoints = 1000 (full cycle resets progress)', () => {
      // 1000 % 1000 = 0 → 0% (belt level just advanced, new cycle begins)
      vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
      vi.mocked(useChildById).mockReturnValue({ child: { ...mockChild, totalPoints: 1000 }, loading: false } as any)
      render(<HomeProfileCard />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('shows 0% for a new child with 0 points', () => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
      vi.mocked(useChildById).mockReturnValue({ child: { ...mockChild, totalPoints: 0 }, loading: false } as any)
      render(<HomeProfileCard />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('wraps correctly after 1000 points: 1250 → 25%', () => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
      vi.mocked(useChildById).mockReturnValue({ child: { ...mockChild, totalPoints: 1250 }, loading: false } as any)
      render(<HomeProfileCard />)
      expect(screen.getByText('25%')).toBeInTheDocument()
    })
  })
})
