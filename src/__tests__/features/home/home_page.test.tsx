import { render, screen } from '@testing-library/react'

vi.mock('@/components/home/HomeHero', () => ({ HomeHero: () => <div data-testid="home-hero">HomeHero</div> }))
vi.mock('@/components/home/HomeProfileCard', () => ({ HomeProfileCard: () => <div data-testid="home-profile">HomeProfile</div> }))
vi.mock('@/components/home/HomeBeltSection', () => ({ HomeBeltSection: () => <div data-testid="home-belt">HomeBelt</div> }))
vi.mock('@/components/home/HomeRating', () => ({ HomeRating: () => <div data-testid="home-rating">HomeRating</div> }))
vi.mock('@/components/home/HomeTournaments', () => ({ HomeTournaments: () => <div data-testid="home-tournaments">HomeTournaments</div> }))
vi.mock('@/components/home/HomeNews', () => ({ HomeNews: () => <div data-testid="home-news">HomeNews</div> }))
vi.mock('@/components/home/HomeCalendar', () => ({ HomeCalendar: () => <div data-testid="home-calendar">HomeCalendar</div> }))
vi.mock('@/components/home/HomeCoaches', () => ({ HomeCoaches: () => <div data-testid="home-coaches">HomeCoaches</div> }))

import DashboardHomePage from '@/app/(dashboard)/page'

describe('DashboardHomePage', () => {
  it('renders the HomeHero section', () => {
    render(<DashboardHomePage />)
    expect(screen.getByTestId('home-hero')).toBeInTheDocument()
  })

  it('renders the HomeProfileCard section', () => {
    render(<DashboardHomePage />)
    expect(screen.getByTestId('home-profile')).toBeInTheDocument()
  })

  it('renders the HomeBeltSection', () => {
    render(<DashboardHomePage />)
    expect(screen.getByTestId('home-belt')).toBeInTheDocument()
  })

  it('renders the HomeRating section', () => {
    render(<DashboardHomePage />)
    expect(screen.getByTestId('home-rating')).toBeInTheDocument()
  })

  it('renders the HomeTournaments section', () => {
    render(<DashboardHomePage />)
    expect(screen.getByTestId('home-tournaments')).toBeInTheDocument()
  })

  it('renders the HomeNews section', () => {
    render(<DashboardHomePage />)
    expect(screen.getByTestId('home-news')).toBeInTheDocument()
  })

  it('renders the HomeCalendar section', () => {
    render(<DashboardHomePage />)
    expect(screen.getByTestId('home-calendar')).toBeInTheDocument()
  })

  it('renders the HomeCoaches section', () => {
    render(<DashboardHomePage />)
    expect(screen.getByTestId('home-coaches')).toBeInTheDocument()
  })

  it('renders all 8 sections in total', () => {
    render(<DashboardHomePage />)
    expect(screen.getByTestId('home-hero')).toBeInTheDocument()
    expect(screen.getByTestId('home-profile')).toBeInTheDocument()
    expect(screen.getByTestId('home-belt')).toBeInTheDocument()
    expect(screen.getByTestId('home-rating')).toBeInTheDocument()
    expect(screen.getByTestId('home-tournaments')).toBeInTheDocument()
    expect(screen.getByTestId('home-news')).toBeInTheDocument()
    expect(screen.getByTestId('home-calendar')).toBeInTheDocument()
    expect(screen.getByTestId('home-coaches')).toBeInTheDocument()
  })
})
