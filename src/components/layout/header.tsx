'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Menu } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { Avatar } from '@/components/ui/avatar'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':      'Головна',
  '/team':           'Команда',
  '/belts':          'Система поясів',
  '/achievements':   'Нагороди',
  '/schedule':       'Розклад',
  '/nutrition':      'Харчування',
  '/competitions':   'Змагання',
  '/fitness':        'Фізпідготовка',
  '/rating':         'Рейтинг',
  '/events':         'Події',
  '/news':           'Новини',
  '/membership':     'Членство',
  '/shop':           'Магазин',
  '/questionnaires': 'Анкети',
  '/notifications':  'Сповіщення',
  '/settings':       'Налаштування',
}

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const { userModel } = useAuth()
  const { unreadCount } = useNotifications(userModel?.uid)

  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? ''

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-white/[.07] bg-[#080808] shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-white/40 hover:text-white transition-colors p-1"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-[15px] font-display font-bold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        <Link
          href="/notifications"
          className="relative p-2 text-white/40 hover:text-white transition-colors rounded-xl hover:bg-white/[.05]"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 size-[14px] bg-[#D50000] text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-glow">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/settings" className="p-1 rounded-xl hover:bg-white/[.05] transition-colors">
          {userModel && <Avatar name={userModel.name} photoUrl={userModel.photoUrl} size="sm" />}
        </Link>
      </div>
    </header>
  )
}
