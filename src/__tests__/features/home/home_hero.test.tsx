import { render, screen } from '@testing-library/react'
import { HomeHero } from '@/components/home/HomeHero'

vi.mock('next/image', () => ({ default: ({ alt }: { alt: string }) => <img alt={alt} /> }))
vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))

describe('HomeHero', () => {
  it('renders the ТРІУМФ heading', () => {
    render(<HomeHero />)
    expect(screen.getByText('ТРІУМФ')).toBeInTheDocument()
  })

  it('renders the judo slogan', () => {
    render(<HomeHero />)
    expect(screen.getByText(/ДЗЮДО ПОЧИНАЄТЬСЯ/i)).toBeInTheDocument()
  })

  it('renders the CTA link pointing to /dashboard', () => {
    render(<HomeHero />)
    const link = screen.getByRole('link', { name: /УВІЙТИ ДО СИСТЕМИ/i })
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('renders all 5 stat labels', () => {
    render(<HomeHero />)
    expect(screen.getByText('Спортсменів')).toBeInTheDocument()
    expect(screen.getByText('Тренувань')).toBeInTheDocument()
    expect(screen.getByText('Турнірів')).toBeInTheDocument()
    expect(screen.getByText('Рейтинг клубу')).toBeInTheDocument()
    expect(screen.getByText('Досягнень')).toBeInTheDocument()
  })

  it('renders correct stat values', () => {
    render(<HomeHero />)
    expect(screen.getByText('243')).toBeInTheDocument()
    expect(screen.getByText('18')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('1540')).toBeInTheDocument()
    expect(screen.getByText('137')).toBeInTheDocument()
  })

  it('renders the hero background image', () => {
    render(<HomeHero />)
    // next/image is mocked to plain <img>
    const img = document.querySelector('img')
    expect(img).toBeInTheDocument()
  })

  it('renders the club subtitle', () => {
    render(<HomeHero />)
    expect(screen.getByText(/Спортивний клуб дзюдо/i)).toBeInTheDocument()
  })
})
