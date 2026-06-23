'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useNotifications } from '@/lib/hooks/useNotifications'

const TABS = [
  { href: '/dashboard',  label: 'Головна',   icon: HomeIcon },
  { href: '/team',       label: 'Команда',    icon: TeamIcon,    coachOnly: true },
  { href: '/belts',      label: 'Пояси',      icon: BeltIcon,    parentAlt: '/belts' },
  { href: '/schedule',   label: 'Розклад',    icon: CalIcon },
  { href: '/rating',     label: 'Рейтинг',    icon: RatingIcon },
  { href: '/settings',   label: 'Профіль',    icon: UserIcon },
]

export function BottomNav() {
  const pathname = usePathname()
  const { userModel } = useAuth()
  const { unreadCount } = useNotifications(userModel?.uid)
  const isCoach = userModel?.role === 'coach'

  const tabs = TABS.filter(t => !(t.coachOnly && !isCoach))

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden">
      {/* safe area backdrop */}
      <div className="bg-[#0D0A09]/95 border-t border-[#34201A] backdrop-blur-xl pb-safe">
        <div className="flex items-center">
          {tabs.map(t => {
            const Icon = t.icon
            const active = pathname === t.href || (t.href !== '/dashboard' && pathname.startsWith(t.href + '/'))
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 flex-1 py-3 text-[10px] font-medium transition-colors relative',
                  active ? 'text-[#FFC400]' : 'text-[#9A9692]'
                )}
              >
                {/* notification dot for settings/notifications */}
                {t.href === '/settings' && unreadCount > 0 && (
                  <span className="absolute top-2 right-[calc(50%-12px)] size-[7px] rounded-full bg-[#E30613]" />
                )}
                <Icon active={active} />
                <span>{t.label}</span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-brand" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

/* ── Inline SVG icons (match mobile app icons) ── */
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
        fill={active ? '#FFC400' : 'none'} stroke={active ? '#FFC400' : '#9A9692'} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M9 21V12h6v9" stroke={active ? '#FFC400' : '#9A9692'} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}
function TeamIcon({ active }: { active: boolean }) {
  const c = active ? '#FFC400' : '#9A9692'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3.5" stroke={c} strokeWidth="1.8"/>
      <path d="M2 20c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M16 3.5c1.657 0 3 1.343 3 3s-1.343 3-3 3M22 20c0-2.761-2.686-5-6-5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}
function BeltIcon({ active }: { active: boolean }) {
  const c = active ? '#FFC400' : '#9A9692'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="9" width="14" height="6" rx="2" stroke={c} strokeWidth="1.8"/>
      <path d="M16 12l4-3v6l-4-3z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="9" y="7" width="4" height="10" rx="1" fill={active ? '#FFC400' : 'none'} stroke={c} strokeWidth="1.8"/>
    </svg>
  )
}
function CalIcon({ active }: { active: boolean }) {
  const c = active ? '#FFC400' : '#9A9692'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="3" stroke={c} strokeWidth="1.8"/>
      <path d="M3 9h18M8 2v4M16 2v4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="7" y="13" width="2" height="2" rx="0.5" fill={c}/>
      <rect x="11" y="13" width="2" height="2" rx="0.5" fill={c}/>
      <rect x="15" y="13" width="2" height="2" rx="0.5" fill={c}/>
    </svg>
  )
}
function RatingIcon({ active }: { active: boolean }) {
  const c = active ? '#FFC400' : '#9A9692'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
        fill={active ? '#FFC400' : 'none'} stroke={c} strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  )
}
function UserIcon({ active }: { active: boolean }) {
  const c = active ? '#FFC400' : '#9A9692'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.8"/>
      <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}
