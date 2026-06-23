'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Menu } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { Avatar } from '@/components/ui/avatar'

interface HeaderProps {
  onMenuClick?: () => void
}

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

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const { userModel } = useAuth()
  const { unreadCount } = useNotifications(userModel?.uid)

  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? ''

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-[#2A1410] bg-[#120605] shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-[#B7B0A8] hover:text-[#F7F5F2] transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-bold text-[#F7F5F2]">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/notifications" className="relative p-2 text-[#B7B0A8] hover:text-[#F7F5F2] transition-colors">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 size-4 bg-[#D50000] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/settings">
          {userModel && <Avatar name={userModel.name} photoUrl={userModel.photoUrl} size="sm" />}
        </Link>
      </div>
    </header>
  )
}
