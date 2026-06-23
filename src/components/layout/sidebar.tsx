'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { Avatar } from '@/components/ui/avatar'
import {
  Users, Award, Calendar, Utensils, Trophy, Home,
  Settings, Bell, ShoppingBag, CreditCard, Dumbbell,
  FileText, Star, ChevronLeft, LogOut, Zap, BookOpen, BarChart2,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  coachOnly?: boolean
  parentOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',       label: 'Головна',     icon: Home },
  { href: '/team',            label: 'Команда',     icon: Users,       coachOnly: true },
  { href: '/belts',           label: 'Пояси',       icon: Award },
  { href: '/achievements',    label: 'Нагороди',    icon: Star },
  { href: '/schedule',        label: 'Розклад',     icon: Calendar },
  { href: '/nutrition',       label: 'Харчування',  icon: Utensils },
  { href: '/competitions',    label: 'Змагання',    icon: Trophy },
  { href: '/fitness',         label: 'Фізпідготовка', icon: Dumbbell },
  { href: '/rating',          label: 'Рейтинг',     icon: BarChart2 },
  { href: '/events',          label: 'Події',       icon: Zap },
  { href: '/news',            label: 'Новини',      icon: BookOpen },
  { href: '/membership',      label: 'Членство',    icon: CreditCard,  coachOnly: true },
  { href: '/shop',            label: 'Магазин',     icon: ShoppingBag },
  { href: '/questionnaires',  label: 'Анкети',      icon: FileText,    coachOnly: true },
  { href: '/notifications',   label: 'Сповіщення',  icon: Bell },
  { href: '/settings',        label: 'Налаштування',icon: Settings },
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

  const items = NAV_ITEMS.filter(item => {
    if (item.coachOnly && !isCoach) return false
    if (item.parentOnly && isCoach) return false
    return true
  })

  return (
    <aside className={cn(
      'flex flex-col h-screen bg-[#120605] border-r border-[#2A1410] transition-all duration-200',
      collapsed ? 'w-[60px]' : 'w-[220px]'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-[#2A1410] shrink-0">
        <div className="size-8 rounded-xl bg-cta-gradient flex items-center justify-center shrink-0">
          <span className="text-sm font-black text-black">Т</span>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#F7F5F2] leading-none">ТРІУМФ</p>
            <p className="text-[10px] text-[#746E68] mt-0.5">Judo Club</p>
          </div>
        )}
        {onToggle && (
          <button onClick={onToggle} className="text-[#746E68] hover:text-[#F7F5F2] transition-colors ml-auto">
            <ChevronLeft size={16} className={cn('transition-transform', collapsed && 'rotate-180')} />
          </button>
        )}
        {onClose && (
          <button onClick={onClose} className="text-[#746E68] hover:text-[#F7F5F2] transition-colors ml-auto lg:hidden">
            ✕
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {items.map(item => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 h-9 px-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-[#D50000]/15 text-[#FFD21A]'
                  : 'text-[#B7B0A8] hover:text-[#F7F5F2] hover:bg-[#1B0A08]'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="shrink-0 border-t border-[#2A1410] p-2">
        {userModel && !collapsed && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-1">
            <Avatar name={userModel.name} photoUrl={userModel.photoUrl} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#F7F5F2] truncate">{userModel.name}</p>
              <p className="text-[10px] text-[#746E68] capitalize">{userModel.role === 'coach' ? 'Тренер' : 'Батько'}</p>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          className={cn(
            'flex items-center gap-2.5 h-9 px-2.5 rounded-xl text-sm text-[#746E68] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-all w-full',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Вийти' : undefined}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Вийти</span>}
        </button>
      </div>
    </aside>
  )
}
