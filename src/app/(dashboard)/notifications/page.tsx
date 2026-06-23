'use client'

import { useAuth } from '@/lib/auth-context'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, BellOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const TYPE_ICON: Record<string, string> = {
  belt: '🥋', achievement: '⭐', event: '📅', membership: '💳', general: '🔔',
}

export default function NotificationsPage() {
  const { userModel } = useAuth()
  const { notifications, loading, unreadCount, markRead, markAllRead } = useNotifications(userModel?.uid)

  const unread = notifications.filter(n => !n.read)
  const read = notifications.filter(n => n.read)

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-[#F7F5F2]">Сповіщення</h1>
          {unreadCount > 0 && <Badge variant="red">{unreadCount}</Badge>}
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="ghost" onClick={markAllRead}>Читати всі</Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-[#120605] animate-pulse" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="p-16 text-center">
          <BellOff size={36} className="mx-auto mb-3 text-[#2A1410]" />
          <p className="font-semibold text-[#746E68]">Сповіщень немає</p>
          <p className="text-sm text-[#2A1410] mt-1">Тут з'являться важливі повідомлення</p>
        </div>
      ) : (
        <>
          {unread.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#746E68] uppercase tracking-wider">Непрочитані</p>
              {unread.map(n => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="w-full flex items-start gap-3 p-3 rounded-2xl bg-[#1B0A08] border border-[#D50000]/20 hover:border-[#D50000]/40 text-left transition-colors"
                >
                  <span className="text-xl shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[#F7F5F2]">{n.title}</p>
                      <span className="text-[10px] text-[#746E68] shrink-0 mt-0.5">{formatDate(n.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[#B7B0A8] mt-0.5 leading-snug">{n.body}</p>
                  </div>
                  <span className="size-2 rounded-full bg-[#D50000] shrink-0 mt-1.5" />
                </button>
              ))}
            </div>
          )}
          {read.length > 0 && (
            <div className="space-y-2">
              {unread.length > 0 && <p className="text-xs font-semibold text-[#746E68] uppercase tracking-wider">Прочитані</p>}
              {read.map(n => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-2xl bg-[#120605] border border-[#2A1410] opacity-60">
                  <span className="text-xl shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[#F7F5F2]">{n.title}</p>
                      <span className="text-[10px] text-[#746E68] shrink-0 mt-0.5">{formatDate(n.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[#B7B0A8] mt-0.5 leading-snug">{n.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
