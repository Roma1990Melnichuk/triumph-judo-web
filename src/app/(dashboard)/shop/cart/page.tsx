'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import {
  useCart,
  removeFromCart,
  updateCartItemQty,
  clearCart,
  placeOrder,
} from '@/lib/hooks/useShop'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ShoppingBag, Trash2, Minus, Plus, Package } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { userModel } = useAuth()
  const router = useRouter()
  const { cart, loading, itemCount } = useCart(userModel?.uid)

  const [showCheckout, setShowCheckout] = useState(false)
  const [placing, setPlacing] = useState(false)

  const [form, setForm] = useState({
    recipientName: userModel?.name ?? '',
    recipientPhone: '',
    deliveryMethod: 'pickup',
    paymentMethod: 'cash',
    comment: '',
  })

  const subtotal = cart?.items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0) ?? 0

  const handleRemove = async (itemId: string) => {
    if (!userModel?.uid) return
    try {
      await removeFromCart(userModel.uid, itemId)
    } catch {
      toast.error('Не вдалось видалити товар')
    }
  }

  const handleQty = async (itemId: string, qty: number) => {
    if (!userModel?.uid) return
    try {
      await updateCartItemQty(userModel.uid, itemId, qty)
    } catch {
      toast.error('Помилка оновлення')
    }
  }

  const handleClear = async () => {
    if (!userModel?.uid) return
    try {
      await clearCart(userModel.uid)
      toast.success('Кошик очищено')
    } catch {
      toast.error('Помилка')
    }
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userModel?.uid || !cart || cart.items.length === 0) return
    if (!form.recipientName.trim() || !form.recipientPhone.trim()) {
      toast.error("Вкажіть ім'я та телефон")
      return
    }
    setPlacing(true)
    try {
      const orderNumber = 'TR-' + Date.now().toString().slice(-6)
      const orderItems = cart.items.map((item) => ({
        productId: item.productId,
        title: item.title,
        quantity: item.quantity,
        price: item.priceSnapshot,
        size: item.size,
      }))
      await placeOrder(userModel.uid, {
        orderNumber,
        items: orderItems,
        totalAmount: subtotal,
        deliveryMethod: form.deliveryMethod,
        paymentMethod: form.paymentMethod,
        recipientName: form.recipientName,
        recipientPhone: form.recipientPhone,
        comment: form.comment,
      })
      toast.success(`Замовлення ${orderNumber} оформлено`)
      setShowCheckout(false)
      router.push('/shop/orders')
    } catch {
      toast.error('Не вдалось оформити замовлення')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="h-8 w-40 rounded-xl bg-[#1A120F] animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-[#1A120F] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-xl text-[#F5F5F5]">Кошик</h1>
          {itemCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#E30613] text-white text-xs font-bold">
              {itemCount}
            </span>
          )}
        </div>
        {(cart?.items.length ?? 0) > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-[#E30613] hover:text-[#FF6A00]">
            Очистити
          </Button>
        )}
      </div>

      {/* Empty state */}
      {!cart || cart.items.length === 0 ? (
        <div className="tr-card p-12 flex flex-col items-center gap-4 text-center">
          <ShoppingBag size={48} className="text-[#34201A]" />
          <p className="text-[#9A9692]">Кошик порожній</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FFC400] hover:text-[#FF6A00] transition-colors"
          >
            ← До магазину
          </Link>
        </div>
      ) : (
        <>
          {/* Items */}
          <div className="tr-card overflow-hidden">
            {cart.items.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-4 ${
                  idx < cart.items.length - 1 ? 'border-b border-[#34201A]' : ''
                }`}
              >
                {/* Image */}
                <div className="w-10 h-10 rounded-xl bg-[#1A120F] border border-[#34201A] flex items-center justify-center shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={16} className="text-[#34201A]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#F5F5F5] truncate">{item.title}</p>
                  {(item.size || item.color) && (
                    <p className="text-xs text-[#9A9692]">
                      {[item.size, item.color].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <p className="text-xs text-[#FFC400] font-bold mt-0.5">
                    {(item.priceSnapshot * item.quantity).toLocaleString('uk-UA')} грн
                  </p>
                </div>

                {/* Qty stepper */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleQty(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-[#1A120F] border border-[#34201A] flex items-center justify-center text-[#F5F5F5] hover:border-[#E30613] transition-colors"
                    aria-label="Зменшити"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-[#F5F5F5]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQty(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-[#1A120F] border border-[#34201A] flex items-center justify-center text-[#F5F5F5] hover:border-[#E30613] transition-colors"
                    aria-label="Збільшити"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9A9692] hover:text-[#E30613] hover:bg-[#E30613]/10 transition-colors shrink-0"
                  aria-label="Видалити"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="tr-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9A9692]">Сума</span>
              <span className="font-display text-lg text-[#FFC400]">
                {subtotal.toLocaleString('uk-UA')} грн
              </span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="tr-btn-brand w-full h-12 px-5 rounded-[16px] text-white font-bold flex items-center justify-center gap-2"
            >
              Оформити замовлення
            </button>
          </div>
        </>
      )}

      {/* Checkout dialog */}
      <Dialog open={showCheckout} onClose={() => setShowCheckout(false)} title="Оформлення замовлення">
        <form onSubmit={handlePlaceOrder} className="space-y-3">
          <Input
            label="Ваше ім'я"
            value={form.recipientName}
            onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
            placeholder="Іван Петренко"
            required
          />
          <Input
            label="Телефон"
            type="text"
            value={form.recipientPhone}
            onChange={(e) => setForm((f) => ({ ...f, recipientPhone: e.target.value }))}
            placeholder="+380 99 000 00 00"
            required
          />
          <Select
            label="Спосіб доставки"
            value={form.deliveryMethod}
            onChange={(e) => setForm((f) => ({ ...f, deliveryMethod: e.target.value }))}
          >
            <option value="pickup">Самовивіз</option>
            <option value="coach">Через тренера</option>
            <option value="postal">Нова Пошта</option>
          </Select>
          <Select
            label="Спосіб оплати"
            value={form.paymentMethod}
            onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
          >
            <option value="cash">Готівка</option>
            <option value="transfer">Переказ на картку</option>
          </Select>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#9A9692] uppercase tracking-wider">
              Коментар
            </label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Додаткові побажання..."
              rows={3}
              className="w-full rounded-xl bg-[#1A120F] border border-[#34201A] text-[#F5F5F5] text-sm px-3 py-2 placeholder-[#9A9692] focus:outline-none focus:border-[#E30613] resize-none transition-colors"
            />
          </div>

          {/* Order total recap */}
          <div className="flex items-center justify-between py-2 border-t border-[#34201A]">
            <span className="text-sm text-[#9A9692]">До сплати</span>
            <span className="font-display text-base text-[#FFC400]">
              {subtotal.toLocaleString('uk-UA')} грн
            </span>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="ghost" type="button" onClick={() => setShowCheckout(false)}>
              Скасувати
            </Button>
            <button
              type="submit"
              disabled={placing}
              className="tr-btn-brand h-10 px-5 rounded-[16px] text-white font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {placing && (
                <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Підтвердити замовлення
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
