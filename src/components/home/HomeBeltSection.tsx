'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useChildById } from '@/lib/hooks/useChildren'
import { BELT_LEVELS, BELT_DISPLAY, BELT_COLOR } from '@/lib/constants'

const BELT_PHOTO: Partial<Record<string, string>> = {
  white:       '/brand/belts-photo/white.png',
  whiteYellow: '/brand/belts-photo/white-yellow.png',
  yellow:      '/brand/belts-photo/yellow.png',
  yellowOrange:'/brand/belts-photo/yellow-orange.png',
  orange:      '/brand/belts-photo/orange.png',
  orangeGreen: '/brand/belts-photo/orange-green.png',
  green:       '/brand/belts-photo/green.png',
  greenBlue:   '/brand/belts-photo/blue.png',
  blue:        '/brand/belts-photo/blue.png',
  blueBrown:   '/brand/belts-photo/brown.png',
  brown:       '/brand/belts-photo/brown.png',
  black:       '/brand/belts-photo/black.png',
}

export function HomeBeltSection() {
  const { userModel } = useAuth()
  const childId = userModel?.childIds?.[0]
  const { child } = useChildById(childId)

  const currentBelt = child?.currentBelt ?? 'white'
  const currentIdx = BELT_LEVELS.indexOf(currentBelt)
  const pct = Math.min(100, Math.round((( child?.totalPoints ?? 0) % 1000) / 10))
  const beltColor = BELT_COLOR[currentBelt] ?? '#E30613'
  const beltName = BELT_DISPLAY[currentBelt] ?? currentBelt

  return (
    <div className="rounded-[24px] p-5 flex flex-col gap-4"
         style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-5 rounded-sm" style={{ background: beltColor, boxShadow: `0 0 8px ${beltColor}88` }} />
          <span className="font-display font-black text-[#F5F5F5] text-base uppercase tracking-wide">{beltName} пояс</span>
        </div>
        <Link href="/belts" className="text-[#9A9692] hover:text-[#FF6A00] transition-colors">
          <ChevronRight size={18} />
        </Link>
      </div>

      {/* Belt row */}
      <div className="grid grid-cols-5 gap-2">
        {BELT_LEVELS.map((belt, idx) => {
          const photo = BELT_PHOTO[belt]
          const isActive = idx === currentIdx
          const isPast = idx < currentIdx
          return (
            <div key={belt}
                 className={`relative rounded-[10px] overflow-hidden aspect-[2/1] transition-all ${
                   isActive ? 'ring-2 scale-105' : isPast ? 'opacity-60' : 'opacity-25'
                 }`}
                 style={isActive ? { boxShadow: `0 0 12px ${beltColor}66, 0 0 0 2px ${beltColor}` } : undefined}>
              {photo ? (
                <Image src={photo} alt={BELT_DISPLAY[belt] ?? belt} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0" style={{ background: BELT_COLOR[belt] ?? '#555' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-[#9A9692] mb-1.5">
          <span>Прогрес до наступного поясу</span>
          <span className="font-bold" style={{ color: beltColor }}>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-[#1A120F] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
               style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${beltColor}, #FFC400)` }} />
        </div>
        <p className="text-[10px] text-[#9A9692] mt-1.5">
          Рівень {currentIdx + 1} / {BELT_LEVELS.length}
        </p>
      </div>

      {/* Link to belts page */}
      <Link href="/belts" className="text-center text-xs font-semibold text-[#FF6A00] hover:text-[#FFC400] transition-colors">
        Записатися на атестацію →
      </Link>
    </div>
  )
}
