import { cn } from '@/lib/utils'
import { BELT_DISPLAY, BELT_COLOR, BELT_ABBR } from '@/lib/constants'
import type { BeltLevel } from '@/lib/types'

interface BeltBadgeProps {
  belt: BeltLevel
  showName?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const LIGHT_BELTS: BeltLevel[] = ['white','whiteYellow','yellow','yellowOrange','orange']

export function BeltBadge({ belt, showName, size = 'md', className }: BeltBadgeProps) {
  const color = BELT_COLOR[belt]
  const isLight = LIGHT_BELTS.includes(belt)
  const textColor = isLight ? '#000' : '#fff'
  const sizes = { sm: 'h-5 px-1.5 text-xs', md: 'h-6 px-2 text-xs', lg: 'h-8 px-3 text-sm' }

  return (
    <span
      className={cn('inline-flex items-center rounded-full font-bold', sizes[size], className)}
      style={{ backgroundColor: color, color: textColor }}
    >
      {showName ? BELT_DISPLAY[belt] : BELT_ABBR[belt]}
    </span>
  )
}

export function BeltStrip({ belt, className }: { belt: BeltLevel; className?: string }) {
  return (
    <div
      className={cn('h-3 rounded-full', className)}
      style={{ background: BELT_COLOR[belt] }}
    />
  )
}
