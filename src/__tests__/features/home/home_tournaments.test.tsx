import { render, screen } from '@testing-library/react'
import { HomeTournaments } from '@/components/home/HomeTournaments'
import { useAuth } from '@/lib/auth-context'
import { useChildCompetitions } from '@/lib/hooks/useCompetitions'

vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/hooks/useCompetitions', () => ({ useChildCompetitions: vi.fn() }))

const mockParent = { uid: 'p1', email: 'p@test.com', name: 'Батько', role: 'parent' as const, childIds: ['c1'], individualPrice: 0, paymentCards: [] }
const mockCoach  = { uid: 'coach1', email: 'c@test.com', name: 'Андрій Бояко', role: 'coach' as const, childIds: [], individualPrice: 0, paymentCards: [] }
const mockChild  = { id: 'c1', firstName: 'Максим', lastName: 'Іванов', birthYear: 2012, weightCategory: '-40кг', currentBelt: 'yellow' as const, coachId: 'coach1', coachName: 'Тренер', totalPoints: 750, createdAt: new Date(), beltReady: false, bonusPoints: 0 }

const mockResult = {
  id: 'r1', childId: 'c1', competitionName: 'Kyiv Judo Open 2024',
  date: new Date('2026-03-15'), place: 1, medal: 'gold' as const,
  weight: '-40кг', points: 100, coachId: 'coach1',
}
const mockResult2 = {
  id: 'r2', childId: 'c1', competitionName: 'Харків Турнір',
  date: new Date('2026-02-10'), place: 3, medal: 'bronze' as const,
  weight: '-40кг', points: 30, coachId: 'coach1',
}

describe('HomeTournaments', () => {
  describe('section header', () => {
    it('renders the Турніри heading', () => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
      vi.mocked(useChildCompetitions).mockReturnValue({ results: [], loading: false } as any)
      render(<HomeTournaments />)
      expect(screen.getByText('Турніри')).toBeInTheDocument()
    })

    it('renders link to /competitions', () => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
      vi.mocked(useChildCompetitions).mockReturnValue({ results: [], loading: false } as any)
      render(<HomeTournaments />)
      expect(screen.getByRole('link', { name: /ВСІ/i })).toHaveAttribute('href', '/competitions')
    })
  })

  describe('parent view — empty state', () => {
    it('shows empty message when no results', () => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
      vi.mocked(useChildCompetitions).mockReturnValue({ results: [], loading: false } as any)
      render(<HomeTournaments />)
      expect(screen.getByText(/Результатів поки немає/i)).toBeInTheDocument()
    })
  })

  describe('parent view — with results', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
      vi.mocked(useChildCompetitions).mockReturnValue({ results: [mockResult, mockResult2], loading: false } as any)
    })

    it('shows competition name', () => {
      render(<HomeTournaments />)
      expect(screen.getByText('Kyiv Judo Open 2024')).toBeInTheDocument()
    })

    it('shows place badge for each result', () => {
      render(<HomeTournaments />)
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('shows gold medal label for place 1', () => {
      render(<HomeTournaments />)
      expect(screen.getByText(/Золото/i)).toBeInTheDocument()
    })

    it('shows bronze medal label for place 3', () => {
      render(<HomeTournaments />)
      expect(screen.getByText(/Бронза/i)).toBeInTheDocument()
    })

    it('shows weight category', () => {
      render(<HomeTournaments />)
      const weights = screen.getAllByText(/-40кг/)
      expect(weights.length).toBeGreaterThan(0)
    })
  })

  describe('loading state', () => {
    it('shows loading skeletons', () => {
      vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
      vi.mocked(useChildCompetitions).mockReturnValue({ results: [], loading: true } as any)
      const { container } = render(<HomeTournaments />)
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })
})
