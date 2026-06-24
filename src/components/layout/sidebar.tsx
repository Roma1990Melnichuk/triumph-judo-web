'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { Avatar } from '@/components/ui/avatar'
import {
  Users, Award, Calendar, Utensils, Trophy, Home,
  Settings, Bell, ShoppingBag, CreditCard, Dumbbell,
  FileText, BarChart2, LogOut, ChevronLeft, Zap, BookOpen, Star,
  MessageSquare, Clock, Flame, UserCircle,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  coachOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',       label: 'Головна',       icon: Home },
  { href: '/team',            label: 'Команда',        icon: Users,      coachOnly: true },
  { href: '/belts',           label: 'Пояси',          icon: Award },
  { href: '/achievements',    label: 'Нагороди',       icon: Star },
  { href: '/loyalty',         label: 'Triumph Points', icon: Flame },
  { href: '/schedule',        label: 'Розклад',        icon: Calendar },
  { href: '/nutrition',       label: 'Харчування',     icon: Utensils },
  { href: '/competitions',    label: 'Змагання',       icon: Trophy },
  { href: '/fitness',         label: 'Фізпідготовка',  icon: Dumbbell },
  { href: '/rating',          label: 'Рейтинг',        icon: BarChart2 },
  { href: '/messages',        label: 'Повідомлення',   icon: MessageSquare },
  { href: '/slots',           label: 'Слоти',          icon: Clock },
  { href: '/events',          label: 'Події',          icon: Zap },
  { href: '/news',            label: 'Новини',         icon: BookOpen },
  { href: '/news/honor-board', label: 'Дошка пошани',  icon: Star },
  { href: '/membership',      label: 'Членство',       icon: CreditCard, coachOnly: true },
  { href: '/shop',            label: 'Магазин',        icon: ShoppingBag },
  { href: '/questionnaires',  label: 'Анкети',         icon: FileText,   coachOnly: true },
  { href: '/notifications',   label: 'Сповіщення',     icon: Bell },
  { href: '/settings',        label: 'Налаштування',   icon: Settings },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  onClose?: () => void
}

export function Sidebar({ collapsed, onToggle, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { userModel, signOut } = useAuth()
  const isCoach = userModel?.role === 'coach'

  const items = NAV_ITEMS.filter(item => !(item.coachOnly && !isCoach))

  return (
    <aside className={cn(
      'flex flex-col h-screen transition-all duration-200 shrink-0',
      'bg-[#080808] border-r border-white/[.08]',
      collapsed ? 'w-[60px]' : 'w-[220px]'
    )}>
      {/* ── Logo ──────────────────────────────────── */}
      <div className={cn(
        'flex items-center gap-3 h-14 border-b border-white/[.07] shrink-0',
        collapsed ? 'px-3 justify-center' : 'px-4'
      )}>
        <div className="size-8 rounded-xl overflow-hidden shrink-0 ring-1 ring-white/10">
          <Image src="/brand/triumph-icon-fg.png" alt="ТРІУМФ" width={32} height={32} className="object-cover" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-display font-black text-white leading-none tracking-wide">ТРІУМФ</p>
            <p className="text-[9px] text-white/35 mt-0.5 uppercase tracking-widest">Judo Club</p>
          </div>
        )}
        {onToggle && !onClose && (
          <button onClick={onToggle} className="text-white/25 hover:text-white/60 transition-colors ml-auto shrink-0">
            <ChevronLeft size={15} className={cn('transition-transform duration-200', collapsed && 'rotate-180')} />
          </button>
        )}
        {onClose && (
          <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors ml-auto lg:hidden">
            <span className="text-sm">✕</span>
          </button>
        )}
      </div>

      {/* ── Nav ───────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {items.map(item => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 h-9 rounded-xl text-[13px] font-medium transition-all duration-150',
                collapsed ? 'px-0 justify-center' : 'px-3',
                active
                  ? 'bg-[#D50000]/14 text-[#FFCC00]'
                  : 'text-white/45 hover:text-white/85 hover:bg-white/[.05]'
              )}
            >
              <Icon size={15} className={cn('shrink-0', active && 'text-[#FF3D00]')} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && active && (
                <span className="ml-auto size-1.5 rounded-full bg-[#FF3D00]" />
              )}
            </Link>
          )
        })}
        {isCoach && userModel && (() => {
          const href = `/coaches/${userModel.uid}`
          const active = pathname.startsWith(href)
          return (
            <Link
              href={href}
              onClick={onClose}
              title={collapsed ? 'Мій профіль' : undefined}
              className={cn(
                'flex items-center gap-3 h-9 rounded-xl text-[13px] font-medium transition-all duration-150',
                collapsed ? 'px-0 justify-center' : 'px-3',
                active
                  ? 'bg-[#D50000]/14 text-[#FFCC00]'
                  : 'text-white/45 hover:text-white/85 hover:bg-white/[.05]'
              )}
            >
              <UserCircle size={15} className={cn('shrink-0', active && 'text-[#FF3D00]')} />
              {!collapsed && <span className="truncate">Мій профіль</span>}
              {!collapsed && active && <span className="ml-auto size-1.5 rounded-full bg-[#FF3D00]" />}
            </Link>
          )
        })()}
      </nav>

      {/* ── User footer ───────────────────────────── */}
      <div className="shrink-0 border-t border-white/[.07] p-2 space-y-1">
        {userModel && !collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl">
            <Avatar name={userModel.name} photoUrl={userModel.photoUrl} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{userModel.name}</p>
              <p className="text-[10px] text-white/35">{userModel.role === 'coach' ? 'Тренер' : 'Батько'}</p>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          title={collapsed ? 'Вийти' : undefined}
          className={cn(
            'flex items-center gap-2.5 h-9 rounded-xl text-[13px] text-white/35 hover:text-[#FF3D00] hover:bg-[#FF3D00]/10 transition-all w-full',
            collapsed ? 'justify-center' : 'px-3'
          )}
        >
          <LogOut size={15} className="shrink-0" />
          {!collapsed && <span>Вийти</span>}
        </button>
      </div>
    </aside>
  )
}
