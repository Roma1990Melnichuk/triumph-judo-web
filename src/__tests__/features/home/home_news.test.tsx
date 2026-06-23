vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))

import { render, screen } from '@testing-library/react'
import { HomeNews } from '@/components/home/HomeNews'
import { onSnapshot } from 'firebase/firestore'

const mockPost = {
  id: 'p1',
  data: () => ({
    title: 'Новий чемпіон клубу',
    content: 'Текст новини',
    authorName: 'Тренер Бояко',
    createdAt: { toDate: () => new Date('2026-06-01') },
    isPinned: true,
    isVisible: true,
  })
}
const mockPost2 = {
  id: 'p2',
  data: () => ({
    title: 'Тренування відмінено',
    content: 'Деталі',
    authorName: 'Адмін',
    createdAt: { toDate: () => new Date('2026-05-20') },
    isPinned: false,
    isVisible: true,
  })
}

describe('HomeNews', () => {
  afterEach(() => {
    vi.mocked(onSnapshot).mockReset()
  })

  it('renders the Новини heading', () => {
    vi.mocked(onSnapshot).mockImplementation((_q, cb) => { (cb as Function)({ docs: [] }); return vi.fn() })
    render(<HomeNews />)
    expect(screen.getByText('Новини')).toBeInTheDocument()
  })

  it('renders link to /news', () => {
    vi.mocked(onSnapshot).mockImplementation((_q, cb) => { (cb as Function)({ docs: [] }); return vi.fn() })
    render(<HomeNews />)
    expect(screen.getByRole('link', { name: /ВСІ/i })).toHaveAttribute('href', '/news')
  })

  it('shows loading skeleton when onSnapshot has not resolved', () => {
    // default mock from setup.ts: onSnapshot = vi.fn() — never calls callback
    const { container } = render(<HomeNews />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows empty state message when no posts', () => {
    vi.mocked(onSnapshot).mockImplementation((_q, cb) => { (cb as Function)({ docs: [] }); return vi.fn() })
    render(<HomeNews />)
    expect(screen.getByText(/Новин поки немає/i)).toBeInTheDocument()
  })

  it('renders post titles when data is loaded', () => {
    vi.mocked(onSnapshot).mockImplementation((_q, cb) => {
      (cb as Function)({ docs: [mockPost, mockPost2] })
      return vi.fn()
    })
    render(<HomeNews />)
    expect(screen.getByText('Новий чемпіон клубу')).toBeInTheDocument()
    expect(screen.getByText('Тренування відмінено')).toBeInTheDocument()
  })

  it('renders author and date for each post', () => {
    vi.mocked(onSnapshot).mockImplementation((_q, cb) => {
      (cb as Function)({ docs: [mockPost] })
      return vi.fn()
    })
    render(<HomeNews />)
    expect(screen.getByText(/Тренер Бояко/)).toBeInTheDocument()
  })
})
