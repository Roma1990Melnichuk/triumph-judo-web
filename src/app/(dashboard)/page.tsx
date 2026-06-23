'use client'

import { HomeHero } from '@/components/home/HomeHero'
import { HomeProfileCard } from '@/components/home/HomeProfileCard'
import { HomeBeltSection } from '@/components/home/HomeBeltSection'
import { HomeRating } from '@/components/home/HomeRating'
import { HomeTournaments } from '@/components/home/HomeTournaments'
import { HomeNews } from '@/components/home/HomeNews'
import { HomeCalendar } from '@/components/home/HomeCalendar'
import { HomeCoaches } from '@/components/home/HomeCoaches'

export default function DashboardHomePage() {
  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Row 1: Hero + Profile */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <HomeHero />
        <HomeProfileCard />
      </div>

      {/* Row 2: Belts + Rating + Tournaments */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <HomeBeltSection />
        <HomeRating />
        <HomeTournaments />
      </div>

      {/* Row 3: News + Calendar + Coaches */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <HomeNews />
        <HomeCalendar />
        <HomeCoaches />
      </div>
    </div>
  )
}
