import { render, screen } from '@testing-library/react'
import { HomeCoaches } from '@/components/home/HomeCoaches'
import { useCoaches } from '@/lib/hooks/useMessages'

vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
vi.mock('@/lib/hooks/useMessages', () => ({ useCoaches: vi.fn() }))

const mockCoaches = [
  { uid: 'coach1', name: 'Андрій Бояко' },
  { uid: 'coach2', name: 'Світлана Коваль' },
]

describe('HomeCoaches', () => {
  it('renders the Тренери heading', () => {
    vi.mocked(useCoaches).mockReturnValue({ coaches: [], loading: false } as any)
    render(<HomeCoaches />)
    expect(screen.getByText('Тренери')).toBeInTheDocument()
  })

  it('renders link to /team', () => {
    vi.mocked(useCoaches).mockReturnValue({ coaches: [], loading: false } as any)
    render(<HomeCoaches />)
    expect(screen.getByRole('link', { name: /ВСІ/i })).toHaveAttribute('href', '/team')
  })

  it('shows loading skeleton when loading', () => {
    vi.mocked(useCoaches).mockReturnValue({ coaches: [], loading: true } as any)
    const { container } = render(<HomeCoaches />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows empty message when no coaches', () => {
    vi.mocked(useCoaches).mockReturnValue({ coaches: [], loading: false } as any)
    render(<HomeCoaches />)
    expect(screen.getByText(/Тренерів ще немає/i)).toBeInTheDocument()
  })

  it('renders each coach name', () => {
    vi.mocked(useCoaches).mockReturnValue({ coaches: mockCoaches, loading: false } as any)
    render(<HomeCoaches />)
    expect(screen.getByText('Андрій Бояко')).toBeInTheDocument()
    expect(screen.getByText('Світлана Коваль')).toBeInTheDocument()
  })

  it('renders "Тренер з дзюдо" label for each coach', () => {
    vi.mocked(useCoaches).mockReturnValue({ coaches: mockCoaches, loading: false } as any)
    render(<HomeCoaches />)
    const labels = screen.getAllByText(/Тренер з дзюдо/i)
    expect(labels).toHaveLength(2)
  })

  it('shows at most 3 coaches', () => {
    const fourCoaches = [
      ...mockCoaches,
      { uid: 'coach3', name: 'Третій Тренер' },
      { uid: 'coach4', name: 'Четвертий Тренер' },
    ]
    vi.mocked(useCoaches).mockReturnValue({ coaches: fourCoaches, loading: false } as any)
    render(<HomeCoaches />)
    const labels = screen.getAllByText(/Тренер з дзюдо/i)
    expect(labels).toHaveLength(3)
  })

  it('renders avatar initials for each coach', () => {
    vi.mocked(useCoaches).mockReturnValue({ coaches: mockCoaches, loading: false } as any)
    render(<HomeCoaches />)
    // Avatar renders initials from name: "Андрій Бояко" → "АБ"
    expect(screen.getByText('АБ')).toBeInTheDocument()
    expect(screen.getByText('СК')).toBeInTheDocument()
  })
})
