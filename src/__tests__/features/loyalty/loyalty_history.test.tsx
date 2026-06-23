import { render, screen, fireEvent } from '@testing-library/react'
import XPHistoryPage from '@/app/(dashboard)/loyalty/history/page'
import { useAuth } from '@/lib/auth-context'
import { useChildById } from '@/lib/hooks/useChildren'
import { useXPHistory } from '@/lib/hooks/useXP'

vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/hooks/useChildren', () => ({ useChildById: vi.fn() }))
vi.mock('@/lib/hooks/useXP', () => ({ useXPHistory: vi.fn() }))

const mockParent = { uid: 'p1', email: 'p@test.com', name: 'Батько', role: 'parent' as const, childIds: ['c1'], individualPrice: 0, paymentCards: [] }
const mockChild  = { id: 'c1', firstName: 'Максим', lastName: 'Іванов', birthYear: 2012, weightCategory: '-40кг', currentBelt: 'yellow' as const, coachId: 'coach1', coachName: 'Тренер', totalPoints: 750, createdAt: new Date(), beltReady: false, bonusPoints: 0 }

const txList = [
  { id: 'tx1', childId: 'c1', amount: 10, source: 'attendance' as const, description: 'Тренування', createdAt: new Date() },
  { id: 'tx2', childId: 'c1', amount: 30, source: 'exercise' as const, description: 'Вправа складна', createdAt: new Date() },
  { id: 'tx3', childId: 'c1', amount: -50, source: 'reward_spend' as const, description: 'Обмін: футболка', createdAt: new Date() },
]

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ userModel: mockParent, loading: false } as any)
  vi.mocked(useChildById).mockReturnValue({ child: mockChild, loading: false } as any)
  vi.mocked(useXPHistory).mockReturnValue({ transactions: txList, loading: false })
})

describe('XPHistoryPage', () => {
  it('shows page heading', () => {
    render(<XPHistoryPage />)
    expect(screen.getByText(/Історія XP/i)).toBeInTheDocument()
  })

  it('shows current XP balance in header', () => {
    render(<XPHistoryPage />)
    expect(screen.getByText(/750/)).toBeInTheDocument()
  })

  it('renders all transactions when filter is "all"', () => {
    render(<XPHistoryPage />)
    // 'Тренування' appears in both the filter button and transaction description
    expect(screen.getAllByText('Тренування').length).toBeGreaterThan(0)
    expect(screen.getByText('Вправа складна')).toBeInTheDocument()
    expect(screen.getByText(/Обмін/)).toBeInTheDocument()
  })

  it('shows positive XP as "+10"', () => {
    render(<XPHistoryPage />)
    expect(screen.getByText('+10')).toBeInTheDocument()
  })

  it('shows negative XP as "-50"', () => {
    render(<XPHistoryPage />)
    expect(screen.getByText('-50')).toBeInTheDocument()
  })

  it('filters to attendance transactions only', () => {
    render(<XPHistoryPage />)
    // filter buttons are the ones with class rounded-xl; click the first "Тренування"
    const buttons = screen.getAllByText('Тренування')
    fireEvent.click(buttons[0])
    // transaction description "Тренування" stays, exercise transaction disappears
    expect(screen.queryByText('Вправа складна')).not.toBeInTheDocument()
  })

  it('shows loading skeleton when loading', () => {
    vi.mocked(useXPHistory).mockReturnValue({ transactions: [], loading: true })
    const { container } = render(<XPHistoryPage />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows empty state when no transactions', () => {
    vi.mocked(useXPHistory).mockReturnValue({ transactions: [], loading: false })
    render(<XPHistoryPage />)
    expect(screen.getByText(/Немає транзакцій/i)).toBeInTheDocument()
  })

  it('has back link to /loyalty', () => {
    render(<XPHistoryPage />)
    const links = screen.getAllByRole('link')
    const back = links.find(l => l.getAttribute('href') === '/loyalty')
    expect(back).toBeTruthy()
  })
})
