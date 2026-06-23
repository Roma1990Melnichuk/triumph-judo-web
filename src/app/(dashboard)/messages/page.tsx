'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  useCoachMessages,
  useParentSentMessages,
  sendMessage,
  markRead,
  useCoaches,
} from '@/lib/hooks/useMessages'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Dialog } from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'
import { MessageSquare, CheckCheck, Send, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

function CoachView() {
  const { userModel } = useAuth()
  const { messages, loading, unreadCount } = useCoachMessages(userModel?.uid)
  const [replyDialogMsg, setReplyDialogMsg] = useState<string | null>(null)

  const handleClick = async (id: string, isUnread: boolean) => {
    if (isUnread) {
      await markRead(id)
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-display font-bold text-[#F5F5F5]">Повідомлення</h1>
        {unreadCount > 0 && <Badge variant="error">{unreadCount}</Badge>}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-[#12100F] animate-pulse" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="py-16 text-center">
          <MessageSquare size={40} className="mx-auto mb-3 text-[#34201A]" />
          <p className="font-semibold text-[#9A9692]">Нових повідомлень немає</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => {
                handleClick(msg.id, !msg.readByCoach)
                setReplyDialogMsg(msg.id)
              }}
              className="w-full text-left tr-card p-4 transition-opacity hover:opacity-90"
              style={!msg.readByCoach ? { borderLeft: '3px solid #E30613' } : undefined}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span
                  className={`text-sm ${!msg.readByCoach ? 'font-bold text-[#F5F5F5]' : 'font-medium text-[#9A9692]'}`}
                >
                  {msg.fromParentName}
                </span>
                <span className="text-[10px] text-[#9A9692] shrink-0 mt-0.5">
                  {formatDate(msg.sentAt)}
                </span>
              </div>
              <p className="text-sm text-[#9A9692] line-clamp-2 leading-snug">{msg.body}</p>
            </button>
          ))}
        </div>
      )}

      <Dialog
        open={replyDialogMsg !== null}
        onClose={() => setReplyDialogMsg(null)}
        title="Відповісти"
      >
        <div className="flex flex-col items-center gap-4 text-center py-2">
          <div className="size-14 rounded-full bg-[#1A120F] flex items-center justify-center">
            <Phone size={24} className="text-[#FF6A00]" />
          </div>
          <p className="text-sm text-[#9A9692] leading-relaxed">
            Відповідь на повідомлення здійснюється через телефонний дзвінок.<br />
            Знайдіть контакт батька у своєму телефоні або в профілі учня.
          </p>
          <Button variant="ghost" onClick={() => setReplyDialogMsg(null)}>
            Зрозуміло
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

function ParentView() {
  const { userModel } = useAuth()
  const { coaches, loading: coachesLoading } = useCoaches()
  const { messages: sent, loading: sentLoading } = useParentSentMessages(userModel?.uid)

  const [selectedCoachId, setSelectedCoachId] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  const effectiveCoachId = coaches.length === 1 ? coaches[0].uid : selectedCoachId

  const handleSend = async () => {
    if (!effectiveCoachId || body.trim().length < 1) return
    if (!userModel) return
    setSending(true)
    try {
      await sendMessage(effectiveCoachId, userModel.uid, userModel.name, body.trim())
      toast.success('Повідомлення надіслано')
      setBody('')
    } catch {
      toast.error('Помилка надсилання')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-xl font-display font-bold text-[#F5F5F5]">Написати тренеру</h1>

      <div className="tr-card p-5 space-y-4">
        {!coachesLoading && coaches.length > 1 && (
          <Select
            label="Тренер"
            value={selectedCoachId}
            onChange={(e) => setSelectedCoachId(e.target.value)}
          >
            <option value="">Оберіть тренера</option>
            {coaches.map((c) => (
              <option key={c.uid} value={c.uid}>
                {c.name}
              </option>
            ))}
          </Select>
        )}

        {!coachesLoading && coaches.length === 1 && (
          <p className="text-sm text-[#9A9692]">
            Тренер: <span className="text-[#F5F5F5] font-semibold">{coaches[0].name}</span>
          </p>
        )}

        <div className="w-full">
          <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wide">
            Повідомлення
          </label>
          <textarea
            rows={4}
            maxLength={500}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Напишіть повідомлення тренеру..."
            className="w-full px-3.5 py-2.5 bg-white/[.06] border border-white/10 rounded-[14px] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#FF3D00]/60 focus:bg-white/[.08] transition-all resize-none"
          />
          <p className="text-right text-[10px] text-[#9A9692] mt-1">{body.length}/500</p>
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !effectiveCoachId || body.trim().length === 0}
          className="tr-btn-brand w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={16} />
          {sending ? 'Надсилання...' : 'Надіслати'}
        </button>
      </div>

      {/* Sent messages */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#9A9692] uppercase tracking-wider">Надіслані</h2>

        {sentLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 rounded-2xl bg-[#12100F] animate-pulse" />
            ))}
          </div>
        ) : sent.length === 0 ? (
          <p className="text-sm text-[#9A9692] text-center py-6">Надісланих повідомлень немає</p>
        ) : (
          sent.map((msg) => (
            <div key={msg.id} className="tr-card p-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#9A9692] mb-1">{formatDate(msg.sentAt)}</p>
                <p className="text-sm text-[#F5F5F5] line-clamp-2">
                  {msg.body.length > 60 ? msg.body.slice(0, 60) + '…' : msg.body}
                </p>
              </div>
              {msg.readByCoach && (
                <CheckCheck size={16} className="text-[#FFC400] shrink-0 mt-1" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const { userModel } = useAuth()

  if (!userModel) return null

  return userModel.role === 'coach' ? <CoachView /> : <ParentView />
}
