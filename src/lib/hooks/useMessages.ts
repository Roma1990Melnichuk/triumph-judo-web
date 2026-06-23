'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

export interface MessageDoc {
  id: string
  fromParentId: string
  fromParentName: string
  toCoachId: string
  body: string
  sentAt: Date
  readByCoach: boolean
}

function fromFirestore(id: string, d: Record<string, unknown>): MessageDoc {
  return {
    id,
    fromParentId: (d.fromParentId as string) ?? '',
    fromParentName: (d.fromParentName as string) ?? '',
    toCoachId: (d.toCoachId as string) ?? '',
    body: (d.body as string) ?? '',
    sentAt: (d.sentAt as Timestamp)?.toDate() ?? new Date(),
    readByCoach: (d.readByCoach as boolean) ?? false,
  }
}

export function useCoachMessages(coachId?: string) {
  const [messages, setMessages] = useState<MessageDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coachId) { setLoading(false); return }
    const q = query(
      collection(db, 'messages'),
      where('toCoachId', '==', coachId),
      orderBy('sentAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => fromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [coachId])

  const unreadCount = messages.filter(m => !m.readByCoach).length

  return { messages, loading, unreadCount }
}

export function useParentSentMessages(parentId?: string) {
  const [messages, setMessages] = useState<MessageDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!parentId) { setLoading(false); return }
    const q = query(
      collection(db, 'messages'),
      where('fromParentId', '==', parentId),
      orderBy('sentAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => fromFirestore(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    })
    return unsub
  }, [parentId])

  return { messages, loading }
}

export async function sendMessage(
  toCoachId: string,
  fromParentId: string,
  fromParentName: string,
  body: string
): Promise<void> {
  await addDoc(collection(db, 'messages'), {
    toCoachId,
    fromParentId,
    fromParentName,
    body,
    readByCoach: false,
    sentAt: serverTimestamp(),
  })
}

export async function markRead(messageId: string): Promise<void> {
  await updateDoc(doc(db, 'messages', messageId), { readByCoach: true })
}

export async function deleteMessage(messageId: string): Promise<void> {
  await deleteDoc(doc(db, 'messages', messageId))
}

export interface CoachRef {
  uid: string
  name: string
}

export function useCoaches() {
  const [coaches, setCoaches] = useState<CoachRef[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'coach')
    )
    const unsub = onSnapshot(q, (snap) => {
      setCoaches(snap.docs.map(d => ({
        uid: d.id,
        name: (d.data().name as string) ?? '',
      })))
      setLoading(false)
    })
    return unsub
  }, [])

  return { coaches, loading }
}
