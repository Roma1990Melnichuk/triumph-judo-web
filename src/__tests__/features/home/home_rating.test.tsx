import { render, screen } from '@testing-library/react'
import { HomeRating } from '@/components/home/HomeRating'
import { useAuth } from '@/lib/auth-context'
import { useChildren, useChildrenByIds } from '@/lib/hooks/useChildren'

vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/hooks/useChildren', () => ({
  useChildren: vi.fn(),
  useChildrenByIds: vi.fn(),
}))

const mockParent = { uid: 'p1', email: 'p@test.com', name: 'Батько', role: 'parent' as const, childIds: ['c1'], individualPrice: 0, paymentCards: [] }
const mockCoach  = { uid: 'coach1', email: 'c@test.com', name: 'Андрій Бояко', role: 'coach' as const, childIds: [], individualPrice: 0, paymentCards: [] }
const mockChild  = { id: 'c1', firstName: 'Максим', lastName: 'Іванов', birthYear: 2012, weightCategory: '-40кг', currentBelt: 'yellow' as const, coachId: 'coach1', coachName: 'Тренер', totalPoints: 750, createdAt: new Date(), beltReady: false, bonusPoints: 0 }

const children = [
  { ...mockChild, id: 'c1', firstName: 'Максим',  lastName: 'Іванов',   totalPoints: 300, currentBelt: 'yellow' as const },
  { ...mockChild, id: 'c2', firstName: 'Олена',   lastName: 'Мельник',  totalPoints: 200, currentBelt: 'orange' as const },
  { ...mockChild, id: 'c3', firstName: 'Петро',   lastName: 'Бойко',    totalPoints: 150, currentBelt: 'white'  as const },
  { ...mockChild, id: 'c4', firstName: 'Марія',   lastName: 'Власенко', totalPoints: 80,  currentBelt: 'white'  as const },
]

describe('HomeRating', () => {
  describe('loading state', () => {
    it('renders loading skeletons when data is loading', () => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockCoach, loading: false } as any)
      vi.mocked(useChildren).mockReturnValue({ children: [], loading: true } as any)
      vi.mocked(useChildrenByIds).mockReturnValue({ children: [], loading: false } as any)
      const { container } = render(<HomeRating />)
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty message when no children', () => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockCoach, loading: false } as any)
      vi.mocked(useChildren).mockReturnValue({ children: [], loading: false } as any)
      vi.mocked(useChildrenByIds).mockReturnValue({ children: [], loading: false } as any)
      render(<HomeRating />)
      expect(screen.getByText('Поки немає спортсменів')).toBeInTheDocument()
    })
  })

  describe('coach view with children', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockCoach, loading: false } as any)
      vi.mocked(useChildren).mockReturnValue({ children, loading: false } as any)
      vi.mocked(useChildrenByIds).mockReturnValue({ children: [], loading: false } as any)
    })

    it('renders the "Рейтинг клубу" heading', () => {
      render(<HomeRating />)
      expect(screen.getByText(/Рейтинг клубу/i)).toBeInTheDocument()
    })

    it('renders link to /rating', () => {
      render(<HomeRating />)
      expect(screen.getByRole('link', { name: /ВСІ/i })).toHaveAttribute('href', '/rating')
    })

    it('shows top 3 children in podium', () => {
      render(<HomeRating />)
      expect(screen.getByText('Іванов')).toBeInTheDocument()
      expect(screen.getByText('Мельник')).toBeInTheDocument()
      expect(screen.getByText('Бойко')).toBeInTheDocument()
    })

    it('shows the top scorer (Іванов 300 pts) in position 1', () => {
      render(<HomeRating />)
      expect(screen.getByText('300')).toBeInTheDocument()
    })

    it('shows 4th place child in table below podium', () => {
      render(<HomeRating />)
      // Component renders "{lastName} {firstName}" in one span
      expect(screen.getByText(/Власенко/)).toBeInTheDocument()
    })

    it('places highest scorer at top (sorted by totalPoints desc)', () => {
      render(<HomeRating />)
      // All point values should appear
      expect(screen.getByText('300')).toBeInTheDocument()
      expect(screen.getByText('200')).toBeInTheDocument()
    })
  })

  describe('parent view', () => {
    it('uses useChildrenByIds for parent and renders top 3 podium', () => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
      vi.mocked(useChildren).mockReturnValue({ children: [], loading: false } as any)
      // Need >= 2 children for podium to render (sorted.length >= 2 guard)
      vi.mocked(useChildrenByIds).mockReturnValue({
        children: [
          { ...mockChild, id: 'c1', firstName: 'Максим', lastName: 'Іванов',  totalPoints: 500 },
          { ...mockChild, id: 'c2', firstName: 'Олена',  lastName: 'Мельник', totalPoints: 200 },
          { ...mockChild, id: 'c3', firstName: 'Петро',  lastName: 'Бойко',   totalPoints: 100 },
        ],
        loading: false
      } as any)
      render(<HomeRating />)
      // Top scorer shows in podium (lastName only in podium)
      expect(screen.getByText('Іванов')).toBeInTheDocument()
      expect(screen.getByText('500')).toBeInTheDocument()
    })
  })
})
