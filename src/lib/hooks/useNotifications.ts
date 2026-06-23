'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, limit, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import type { NotificationModel } from '../types'

function fromFirestore(id: string, d: Record<string, unknown>): NotificationModel {
  return {
    id,
    userId: (d.userId as string) ?? '',
    title: (d.title as string) ?? '',
    body: (d.body as string) ?? '',
    type: (d.type as NotificationModel['type']) ?? 'general',
    read: (d.read as boolean) ?? false,
    createdAt: (d.createdAt as Timestamp)?.toDate() ?? new Date(),
    data: d.data as Record<string, string> | undefined,
  }
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<NotificationModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    )
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => fromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [userId])

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true })
  }

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read)
    await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })))
  }

  return { notifications, loading, unreadCount, markRead, markAllRead }
}
