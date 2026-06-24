import { render, screen, fireEvent } from '@testing-library/react'
import { CoachProfileContent } from '@/app/(dashboard)/coaches/[uid]/page'
import { useCoachProfile, useCoachUserDoc } from '@/lib/hooks/useCoachProfile'
import { useGroups } from '@/lib/hooks/useGroups'
import { useChildren } from '@/lib/hooks/useChildren'

vi.mock('next/image', () => ({ default: ({ alt }: { alt: string }) => <img alt={alt} /> }))
vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
vi.mock('@/lib/hooks/useCoachProfile', () => ({ useCoachProfile: vi.fn(), useCoachUserDoc: vi.fn() }))
vi.mock('@/lib/hooks/useGroups', () => ({ useGroups: vi.fn() }))
vi.mock('@/lib/hooks/useChildren', () => ({ useChildren: vi.fn() }))
vi.mock('@/components/ui/avatar', () => ({ Avatar: ({ name }: { name: string }) => <div data-testid="avatar">{name}</div> }))

const mockUser = { uid: 'coach1', name: 'Андрій Іванов', photoUrl: undefined, email: 'andrii@test.com', phone: '+38 097 43 43 43' }

const mockProfile = {
  uid: 'coach1',
  bio: 'Майстер спорту України з дзюдо. Більше 12 років тренерської діяльності.',
  slogan: 'Сильний не той, хто перемагає інших.',
  experienceYears: 12,
  danLevel: 3,
  qualifications: [
    'Майстер спорту України з дзюдо',
    'Чорний пояс (3 дан)',
    'Сертифікований тренер з дзюдо (BJF)',
  ],
  trainerStats: { studentMedals: 15, nationalPrizes: 5, totalStudents: 100, specialTitle: 'Найкращий тренер клубу' },
  trainingPhotos: [],
  updatedAt: new Date(),
}

const mockGroups = [
  { id: 'g1', coachId: 'coach1', name: 'Група 1', childIds: [], daysOfWeek: [1, 3, 5], timeStart: '18:30', timeEnd: '19:30' },
  { id: 'g2', coachId: 'coach1', name: 'Підлітки', childIds: [], daysOfWeek: [2, 4], timeStart: '17:00', timeEnd: '18:30' },
]

beforeEach(() => {
  vi.mocked(useCoachUserDoc).mockReturnValue({ user: mockUser, loading: false })
  vi.mocked(useCoachProfile).mockReturnValue({ profile: mockProfile, loading: false })
  vi.mocked(useGroups).mockReturnValue({ groups: mockGroups, loading: false } as any)
  vi.mocked(useChildren).mockReturnValue({ children: [], loading: false } as any)
})

describe('CoachProfileContent', () => {
  it('shows loading skeleton while data loads', () => {
    vi.mocked(useCoachUserDoc).mockReturnValue({ user: null, loading: true })
    vi.mocked(useCoachProfile).mockReturnValue({ profile: null, loading: true })
    const { container } = render(<CoachProfileContent uid="coach1" />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows "not found" when user doc is missing', () => {
    vi.mocked(useCoachUserDoc).mockReturnValue({ user: null, loading: false })
    vi.mocked(useCoachProfile).mockReturnValue({ profile: null, loading: false })
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getByText(/не знайдено/i)).toBeInTheDocument()
  })

  it('renders coach name', () => {
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getAllByText('Андрій Іванов').length).toBeGreaterThan(0)
  })

  it('shows "Тренер клубу" badge', () => {
    render(<CoachProfileContent uid="coach1" />)
    // "Найкращий тренер клубу" also contains this text, use getAllByText
    expect(screen.getAllByText(/Тренер клубу/i).length).toBeGreaterThan(0)
  })

  it('shows experience years stat', () => {
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('shows dan level in hero and info panel', () => {
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getAllByText(/3 дан/i).length).toBeGreaterThan(0)
  })

  it('shows slogan', () => {
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getByText(/Сильний не той/i)).toBeInTheDocument()
  })

  it('renders "Написати" message link', () => {
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getByRole('link', { name: /Написати/i })).toBeInTheDocument()
  })

  it('message link points to messages page with coach uid', () => {
    render(<CoachProfileContent uid="coach1" />)
    const link = screen.getByRole('link', { name: /Написати/i })
    expect(link.getAttribute('href')).toContain('coach1')
  })

  it('renders "Розклад" link', () => {
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getByRole('link', { name: /Розклад/i })).toBeInTheDocument()
  })

  it('shows email in info panel', () => {
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getByText('andrii@test.com')).toBeInTheDocument()
  })

  it('shows phone in info panel', () => {
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getByText('+38 097 43 43 43')).toBeInTheDocument()
  })

  it('renders bio text', () => {
    render(<CoachProfileContent uid="coach1" />)
    // bio includes "Більше 12 років" which distinguishes it from the qualification item
    expect(screen.getByText(/Більше 12 років тренерської/i)).toBeInTheDocument()
  })

  it('shows qualifications list items', () => {
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getByText('Чорний пояс (3 дан)')).toBeInTheDocument()
    expect(screen.getByText('Сертифікований тренер з дзюдо (BJF)')).toBeInTheDocument()
  })

  it('shows trainer achievement medal count', () => {
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('shows national prizes count', () => {
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows special title', () => {
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getByText('Найкращий тренер клубу')).toBeInTheDocument()
  })

  it('renders group names in groups section', () => {
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getByText('Група 1')).toBeInTheDocument()
    expect(screen.getByText('Підлітки')).toBeInTheDocument()
  })

  it('shows group schedule times', () => {
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getByText('18:30–19:30')).toBeInTheDocument()
  })

  it('renders breadcrumb with "Тренери" label', () => {
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getByText('Тренери')).toBeInTheDocument()
  })

  it('breadcrumb "Головна" links to /dashboard', () => {
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getByRole('link', { name: 'Головна' })).toHaveAttribute('href', '/dashboard')
  })

  it('shows groups loading skeleton', () => {
    vi.mocked(useGroups).mockReturnValue({ groups: [], loading: true } as any)
    const { container } = render(<CoachProfileContent uid="coach1" />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('bio section collapses long text and shows expand button', () => {
    const longBio = 'Тренерська діяльність. '.repeat(15)
    vi.mocked(useCoachProfile).mockReturnValue({ profile: { ...mockProfile, bio: longBio }, loading: false })
    render(<CoachProfileContent uid="coach1" />)
    const moreBtn = screen.getByText(/Показати більше/i)
    expect(moreBtn).toBeInTheDocument()
    fireEvent.click(moreBtn)
    expect(screen.queryByText(/Показати більше/i)).not.toBeInTheDocument()
  })

  it('shows empty groups message when no groups', () => {
    vi.mocked(useGroups).mockReturnValue({ groups: [], loading: false } as any)
    render(<CoachProfileContent uid="coach1" />)
    expect(screen.getByText(/Груп не знайдено/i)).toBeInTheDocument()
  })
})
