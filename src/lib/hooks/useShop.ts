'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  addDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CartItemInput {
  productId: string
  variantId: string
  quantity: number
  priceSnapshot: number
  title: string
  imageUrl: string
  size?: string
  color?: string
}

export interface CartItem extends CartItemInput {
  id: string
}

export interface CartDoc {
  userId: string
  items: CartItem[]
}

export interface ShopOrderDoc {
  id: string
  userId: string
  orderNumber: string
  items: {
    productId: string
    title: string
    quantity: number
    price: number
    size?: string
  }[]
  totalAmount: number
  status: string
  deliveryMethod: string
  paymentMethod: string
  recipientName: string
  recipientPhone: string
  comment: string
  createdAt: Date
}

export interface PlaceOrderInput {
  orderNumber: string
  items: ShopOrderDoc['items']
  totalAmount: number
  deliveryMethod: string
  paymentMethod: string
  recipientName: string
  recipientPhone: string
  comment: string
}

// ─── useCart hook ─────────────────────────────────────────────────────────────

export function useCart(userId?: string) {
  const [cart, setCart] = useState<CartDoc | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    const unsub = onSnapshot(doc(db, 'shop_carts', userId), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Record<string, unknown>
        setCart({
          userId: (data.userId as string) ?? userId,
          items: (data.items as CartItem[]) ?? [],
        })
      } else {
        setCart(null)
      }
      setLoading(false)
    })
    return unsub
  }, [userId])

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return { cart, loading, itemCount }
}

// ─── addToCart ────────────────────────────────────────────────────────────────

export async function addToCart(userId: string, item: CartItemInput): Promise<void> {
  const cartRef = doc(db, 'shop_carts', userId)
  const snap = await getDoc(cartRef)

  let items: CartItem[] = []
  if (snap.exists()) {
    const data = snap.data() as Record<string, unknown>
    items = (data.items as CartItem[]) ?? []
  }

  const existingIndex = items.findIndex(
    (i) => i.productId === item.productId && i.variantId === item.variantId
  )

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      quantity: items[existingIndex].quantity + item.quantity,
    }
  } else {
    items.push({ ...item, id: crypto.randomUUID() })
  }

  await setDoc(cartRef, { userId, items }, { merge: true })
}

// ─── removeFromCart ───────────────────────────────────────────────────────────

export async function removeFromCart(userId: string, itemId: string): Promise<void> {
  const cartRef = doc(db, 'shop_carts', userId)
  const snap = await getDoc(cartRef)
  if (!snap.exists()) return

  const data = snap.data() as Record<string, unknown>
  const items = ((data.items as CartItem[]) ?? []).filter((i) => i.id !== itemId)
  await setDoc(cartRef, { userId, items }, { merge: true })
}

// ─── updateCartItemQty ────────────────────────────────────────────────────────

export async function updateCartItemQty(
  userId: string,
  itemId: string,
  qty: number
): Promise<void> {
  const cartRef = doc(db, 'shop_carts', userId)
  const snap = await getDoc(cartRef)
  if (!snap.exists()) return

  const data = snap.data() as Record<string, unknown>
  const items = ((data.items as CartItem[]) ?? []).map((i) =>
    i.id === itemId ? { ...i, quantity: Math.max(1, qty) } : i
  )
  await setDoc(cartRef, { userId, items }, { merge: true })
}

// ─── clearCart ────────────────────────────────────────────────────────────────

export async function clearCart(userId: string): Promise<void> {
  await setDoc(doc(db, 'shop_carts', userId), { userId, items: [] }, { merge: true })
}

// ─── placeOrder ───────────────────────────────────────────────────────────────

export async function placeOrder(
  userId: string,
  orderData: PlaceOrderInput
): Promise<string> {
  const ref = await addDoc(collection(db, 'shop_orders'), {
    userId,
    orderNumber: orderData.orderNumber,
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    status: 'pending',
    deliveryMethod: orderData.deliveryMethod,
    paymentMethod: orderData.paymentMethod,
    recipientName: orderData.recipientName,
    recipientPhone: orderData.recipientPhone,
    comment: orderData.comment,
    createdAt: serverTimestamp(),
  })
  await clearCart(userId)
  return ref.id
}

// ─── useMyOrders hook ─────────────────────────────────────────────────────────

export function useMyOrders(userId?: string, isCoach?: boolean) {
  const [orders, setOrders] = useState<ShopOrderDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId && !isCoach) {
      setLoading(false)
      return
    }

    let q
    if (isCoach) {
      q = query(collection(db, 'shop_orders'), orderBy('createdAt', 'desc'))
    } else {
      if (!userId) {
        setLoading(false)
        return
      }
      q = query(
        collection(db, 'shop_orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
    }

    const unsub = onSnapshot(q, (snap) => {
      setOrders(
        snap.docs.map((d) => {
          const data = d.data() as Record<string, unknown>
          return {
            id: d.id,
            userId: (data.userId as string) ?? '',
            orderNumber: (data.orderNumber as string) ?? '',
            items: (data.items as ShopOrderDoc['items']) ?? [],
            totalAmount: (data.totalAmount as number) ?? 0,
            status: (data.status as string) ?? 'pending',
            deliveryMethod: (data.deliveryMethod as string) ?? '',
            paymentMethod: (data.paymentMethod as string) ?? '',
            recipientName: (data.recipientName as string) ?? '',
            recipientPhone: (data.recipientPhone as string) ?? '',
            comment: (data.comment as string) ?? '',
            createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
          }
        })
      )
      setLoading(false)
    }, () => setLoading(false))

    return unsub
  }, [userId, isCoach])

  return { orders, loading }
}
