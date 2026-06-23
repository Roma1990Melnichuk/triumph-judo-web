import { render, screen } from '@testing-library/react'
import { HomeBeltSection } from '@/components/home/HomeBeltSection'
import { useAuth } from '@/lib/auth-context'
import { useChildById } from '@/lib/hooks/useChildren'
import { BELT_LEVELS } from '@/lib/constants'

vi.mock('next/image', () => ({ default: ({ alt }: { alt: string }) => <img alt={alt} /> }))
vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/hooks/useChildren', () => ({ useChildById: vi.fn() }))

const mockParent = { uid: 'p1', email: 'p@test.com', name: 'Батько', role: 'parent' as const, childIds: ['c1'], individualPrice: 0, paymentCards: [] }
const mockCoach  = { uid: 'coach1', email: 'c@test.com', name: 'Андрій Бояко', role: 'coach' as const, childIds: [], individualPrice: 0, paymentCards: [] }
const mockChild  = { id: 'c1', firstName: 'Максим', lastName: 'Іванов', birthYear: 2012, weightCategory: '-40кг', currentBelt: 'yellow' as const, coachId: 'coach1', coachName: 'Тренер', totalPoints: 750, createdAt: new Date(), beltReady: false, bonusPoints: 0 }

describe('HomeBeltSection', () => {
  describe('with a child (yellow belt)', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
      vi.mocked(useChildById).mockReturnValue({ child: mockChild, loading: false } as any)
    })

    it('shows the current belt name in the header', () => {
      render(<HomeBeltSection />)
      // mockChild has currentBelt: 'yellow' → BELT_DISPLAY['yellow'] = 'Жовтий'
      expect(screen.getByText(/Жовтий пояс/i)).toBeInTheDocument()
    })

    it('renders belt progression with 12 items (one per belt level)', () => {
      const { container } = render(<HomeBeltSection />)
      // Each belt is rendered as a div in a grid
      // BELT_LEVELS has 12 entries
      const beltItems = container.querySelectorAll('.grid .relative')
      expect(beltItems).toHaveLength(BELT_LEVELS.length) // 12
    })

    it('shows progress percentage label in the bar', () => {
      render(<HomeBeltSection />)
      // 750 % 1000 = 750 → 75%
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('shows the "Прогрес до наступного поясу" label', () => {
      render(<HomeBeltSection />)
      expect(screen.getByText(/Прогрес до наступного поясу/i)).toBeInTheDocument()
    })

    it('shows belt level count', () => {
      render(<HomeBeltSection />)
      // "Рівень X / 12"
      expect(screen.getByText(/Рівень.*12/)).toBeInTheDocument()
    })

    it('links to /belts page', () => {
      render(<HomeBeltSection />)
      const links = screen.getAllByRole('link')
      const beltLinks = links.filter(l => l.getAttribute('href') === '/belts')
      expect(beltLinks.length).toBeGreaterThan(0)
    })

    it('shows attestation link', () => {
      render(<HomeBeltSection />)
      expect(screen.getByText(/атестацію/i)).toBeInTheDocument()
    })
  })

  describe('without a child (coach)', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockCoach, loading: false } as any)
      vi.mocked(useChildById).mockReturnValue({ child: null, loading: false } as any)
    })

    it('defaults to white belt when no child', () => {
      render(<HomeBeltSection />)
      expect(screen.getByText(/Білий пояс/i)).toBeInTheDocument()
    })

    it('still renders 12 belt items in progression', () => {
      const { container } = render(<HomeBeltSection />)
      const beltItems = container.querySelectorAll('.grid .relative')
      expect(beltItems).toHaveLength(BELT_LEVELS.length)
    })
  })

  describe('progress calculation', () => {
    it('shows 50% for 500 total points', () => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
      vi.mocked(useChildById).mockReturnValue({ child: { ...mockChild, totalPoints: 500 }, loading: false } as any)
      render(<HomeBeltSection />)
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('shows 0% for 0 total points', () => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
      vi.mocked(useChildById).mockReturnValue({ child: { ...mockChild, totalPoints: 0 }, loading: false } as any)
      render(<HomeBeltSection />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('shows 0% when totalPoints = 1000 (full cycle resets, new belt level begins)', () => {
      // 1000 % 1000 = 0 → 0% (belt just advanced, new cycle starts)
      vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
      vi.mocked(useChildById).mockReturnValue({ child: { ...mockChild, totalPoints: 1000 }, loading: false } as any)
      render(<HomeBeltSection />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })
  })
})
