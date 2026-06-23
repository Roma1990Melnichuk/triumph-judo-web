'use client'

import { useAuth } from '@/lib/auth-context'
import { useMyOrders } from '@/lib/hooks/useShop'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Phone, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Очікує',
  confirmed: 'Підтверджено',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
  cancelled: 'Скасовано',
}

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'gold' | 'error' | 'default'> = {
  pending: 'warning',
  confirmed: 'success',
  shipped: 'gold',
  delivered: 'success',
  cancelled: 'error',
}

const DELIVERY_LABEL: Record<string, string> = {
  pickup: 'Самовивіз',
  coach: 'Через тренера',
  postal: 'Нова Пошта',
}

const PAYMENT_LABEL: Record<string, string> = {
  cash: 'Готівка',
  transfer: 'Переказ',
}

export default function OrdersPage() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'
  const { orders, loading } = useMyOrders(userModel?.uid, isCoach)

  if (loading) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="h-8 w-48 rounded-xl bg-[#1A120F] animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-[#1A120F] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingBag size={22} className="text-[#E30613]" />
          <h1 className="font-display text-xl text-[#F5F5F5]">
            {isCoach ? 'Всі замовлення' : 'Мої замовлення'}
          </h1>
        </div>
        {!isCoach && (
          <Link
            href="/shop/cart"
            className="text-sm text-[#9A9692] hover:text-[#F5F5F5] transition-colors"
          >
            ← До кошика
          </Link>
        )}
      </div>

      {/* Empty state */}
      {orders.length === 0 ? (
        <div className="tr-card p-12 flex flex-col items-center gap-4 text-center">
          <ShoppingBag size={48} className="text-[#34201A]" />
          <p className="text-[#9A9692]">Замовлень поки немає</p>
          {!isCoach && (
            <Link
              href="/shop"
              className="text-sm font-semibold text-[#FFC400] hover:text-[#FF6A00] transition-colors"
            >
              Перейти до магазину →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="tr-card p-4 space-y-3">
              {/* Order header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="font-display text-sm text-[#F5F5F5]">{order.orderNumber}</p>
                  <p className="text-xs text-[#9A9692]">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant={STATUS_VARIANT[order.status] ?? 'default'}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </Badge>
                  <span className="text-xs text-[#9A9692]">
                    {DELIVERY_LABEL[order.deliveryMethod] ?? order.deliveryMethod}
                    {' · '}
                    {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Coach view: recipient info */}
              {isCoach && (order.recipientName || order.recipientPhone) && (
                <div className="flex flex-wrap gap-3 py-2 px-3 rounded-xl bg-[#1A120F] border border-[#34201A]">
                  {order.recipientName && (
                    <span className="flex items-center gap-1.5 text-xs text-[#9A9692]">
                      <User size={12} className="text-[#FF6A00]" />
                      {order.recipientName}
                    </span>
                  )}
                  {order.recipientPhone && (
                    <span className="flex items-center gap-1.5 text-xs text-[#9A9692]">
                      <Phone size={12} className="text-[#FF6A00]" />
                      {order.recipientPhone}
                    </span>
                  )}
                </div>
              )}

              {/* Items list */}
              <div className="space-y-1">
                {order.items.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <p className="text-xs text-[#9A9692] truncate flex-1">
                      {item.title}
                      {item.size ? ` · ${item.size}` : ''}
                      {' × '}
                      {item.quantity}
                    </p>
                    <span className="text-xs text-[#9A9692] shrink-0">
                      {(item.price * item.quantity).toLocaleString('uk-UA')} грн
                    </span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-xs text-[#9A9692]">
                    + ще {order.items.length - 2} позицій
                  </p>
                )}
              </div>

              {/* Comment */}
              {order.comment && (
                <p className="text-xs italic text-[#9A9692] border-t border-[#34201A] pt-2">
                  {order.comment}
                </p>
              )}

              {/* Total */}
              <div className="flex items-center justify-between border-t border-[#34201A] pt-3">
                <span className="text-xs text-[#9A9692] uppercase tracking-wider font-semibold">
                  Разом
                </span>
                <span className="font-display text-base font-bold text-[#FFC400]">
                  {order.totalAmount.toLocaleString('uk-UA')} грн
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
