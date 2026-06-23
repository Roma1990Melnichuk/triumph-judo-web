'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Users, Trophy, Star, TrendingUp, Award } from 'lucide-react'

const STATS = [
  { icon: Users, label: 'Спортсменів', value: '243' },
  { icon: TrendingUp, label: 'Тренувань', value: '18' },
  { icon: Trophy, label: 'Турнірів', value: '5' },
  { icon: Star, label: 'Рейтинг клубу', value: '1540' },
  { icon: Award, label: 'Досягнень', value: '137' },
]

export function HomeHero() {
  return (
    <div className="relative overflow-hidden rounded-[24px] min-h-[340px] flex flex-col justify-between p-7"
         style={{ background: '#0D0806' }}>
      {/* Background fire image */}
      <Image
        src="/brand/hero/hero-judo-fire-no-logo.png"
        alt=""
        fill
        className="object-cover object-center opacity-70"
        priority
      />
      {/* Dark gradient overlay left→right so text on left reads clearly */}
      <div className="absolute inset-0"
           style={{ background: 'linear-gradient(105deg, rgba(5,3,2,.88) 0%, rgba(5,3,2,.55) 55%, rgba(5,3,2,.1) 100%)' }} />

      {/* Content (z-10 to sit above image) */}
      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Top: title + slogan + CTA */}
        <div className="space-y-4 max-w-md">
          <div>
            <h1 className="font-display font-black text-[#F5F5F5] leading-none"
                style={{ fontSize: 'clamp(48px, 8vw, 80px)', textShadow: '0 2px 24px rgba(227,6,19,.5)' }}>
              ТРІУМФ
            </h1>
            <p className="text-[#FFC400] font-semibold text-sm mt-2 uppercase tracking-widest">
              Спортивний клуб дзюдо
            </p>
          </div>
          <p className="text-[#D0CBC6] text-base font-medium leading-snug max-w-xs">
            ДЗЮДО ПОЧИНАЄТЬСЯ З ПЕРЕМОГИ І НАД СОБОЮ
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[14px] text-white font-bold text-sm uppercase tracking-wide transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(90deg,#E30613 0%,#FF6A00 58%,#FFC400 100%)', boxShadow: '0 4px 20px rgba(227,6,19,.4)' }}
          >
            УВІЙТИ ДО СИСТЕМИ
          </Link>
        </div>

        {/* Stats row at bottom */}
        <div className="grid grid-cols-5 gap-2 mt-8">
          {STATS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-start gap-0.5 bg-black/30 backdrop-blur-sm rounded-[14px] px-3 py-2.5 border border-white/10">
              <Icon size={14} className="text-[#FF6A00]" />
              <span className="text-[#F5F5F5] font-display font-black text-xl leading-none">{value}</span>
              <span className="text-[#9A9692] text-[10px] leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
