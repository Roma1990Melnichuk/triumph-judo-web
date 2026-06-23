'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  useCoachSlots,
  useAvailableSlots,
  useChildBookedSlots,
  createSlot,
  requestSlot,
  confirmSlot,
  cancelSlot,
  deleteSlot,
} from '@/lib/hooks/useSlots'
import { useCoaches } from '@/lib/hooks/useMessages'
import { useChildById } from '@/lib/hooks/useChildren'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'
import { CalendarPlus, CalendarCheck, Clock, Banknote, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Timestamp } from 'firebase/firestore'

type CoachTab = 'requested' | 'available' | 'confirmed'

// ─── Coach view ────────────────────────────────────────────────────────────────

function CoachView() {
  const { userModel } = useAuth()
  const { slots, loading } = useCoachSlots(userModel?.uid)
  const [tab, setTab] = useState<CoachTab>('requested')
  const [addOpen, setAddOpen] = useState(false)

  // Add slot form state
  const [date, setDate] = useState('')
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)

  const requested = slots.filter(s => s.status === 'requested')
  const available = slots.filter(s => s.status === 'available')
  const confirmed = slots.filter(s => s.status === 'confirmed')

  const tabList: { key: CoachTab; label: string; count?: number }[] = [
    { key: 'requested', label: 'Запити', count: requested.length },
    { key: 'available', label: 'Доступні', count: available.length },
    { key: 'confirmed', label: 'Підтверджені' },
  ]

  const handleConfirm = async (id: string) => {
    try {
      await confirmSlot(id)
      toast.success('Слот підтверджено')
    } catch {
      toast.error('Помилка')
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await cancelSlot(id)
      toast.success('Скасовано')
    } catch {
      toast.error('Помилка')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSlot(id)
      toast.success('Слот видалено')
    } catch {
      toast.error('Помилка')
    }
  }

  const handleAddSlot = async () => {
    if (!date || !timeStart || !timeEnd || !price) return
    if (!userModel) return
    setSaving(true)
    try {
      await createSlot({
        coachId: userModel.uid,
        coachName: userModel.name,
        date: new Date(date),
        timeStart,
        timeEnd,
        price: Number(price),
      })
      toast.success('Слот додано')
      setAddOpen(false)
      setDate('')
      setTimeStart('')
      setTimeEnd('')
      setPrice('')
    } catch {
      toast.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-display font-bold text-[#F5F5F5]">Індивідуальні тренування</h1>
        <button
          onClick={() => setAddOpen(true)}
          className="tr-btn-brand flex items-center gap-2 text-sm px-4"
        >
          <CalendarPlus size={16} />
          Додати слот
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl bg-[#12100F] border border-[#34201A]">
        {tabList.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key
                ? 'bg-[#E30613] text-white'
                : 'text-[#9A9692] hover:text-[#F5F5F5]'
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-[#34201A]'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-[#12100F] animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Requested tab */}
          {tab === 'requested' && (
            <div className="space-y-3">
              {requested.length === 0 ? (
                <p className="text-center text-[#9A9692] py-10 text-sm">Немає нових запитів</p>
              ) : requested.map(slot => (
                <div key={slot.id} className="tr-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#F5F5F5]">{slot.childName}</p>
                      <p className="text-sm text-[#9A9692] flex items-center gap-1.5 mt-0.5">
                        <CalendarCheck size={13} />
                        {formatDate(slot.date)}
                        <span className="mx-1 text-[#34201A]">·</span>
                        <Clock size={13} />
                        {slot.timeStart}–{slot.timeEnd}
                      </p>
                    </div>
                    <span className="font-display font-bold text-[#FFC400] text-sm">{slot.price} грн</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfirm(slot.id)}
                      className="tr-btn-brand flex-1 flex items-center justify-center gap-1.5 text-sm"
                    >
                      <CheckCircle2 size={15} />
                      Підтвердити
                    </button>
                    <Button variant="ghost" onClick={() => handleCancel(slot.id)}>
                      Скасувати
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Available tab */}
          {tab === 'available' && (
            <div className="space-y-3">
              {available.length === 0 ? (
                <p className="text-center text-[#9A9692] py-10 text-sm">Доступних слотів немає</p>
              ) : available.map(slot => (
                <div key={slot.id} className="tr-card p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#F5F5F5] flex items-center gap-1.5">
                      <CalendarCheck size={13} className="text-[#9A9692]" />
                      {formatDate(slot.date)}
                    </p>
                    <p className="text-xs text-[#9A9692] flex items-center gap-1.5 mt-0.5">
                      <Clock size={12} />
                      {slot.timeStart}–{slot.timeEnd}
                      <span className="mx-1">·</span>
                      <Banknote size={12} />
                      {slot.price} грн
                    </p>
                    <p className="text-xs text-[#9A9692] mt-1">Немає запитів</p>
                  </div>
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="p-2 rounded-xl text-[#9A9692] hover:text-[#E30613] hover:bg-[#E30613]/10 transition-colors"
                    aria-label="Видалити"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Confirmed tab */}
          {tab === 'confirmed' && (
            <div className="space-y-3">
              {confirmed.length === 0 ? (
                <p className="text-center text-[#9A9692] py-10 text-sm">Підтверджених тренувань немає</p>
              ) : confirmed.map(slot => (
                <div key={slot.id} className="tr-card p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#F5F5F5] text-sm">{slot.childName}</p>
                    <p className="text-xs text-[#9A9692] flex items-center gap-1.5 mt-0.5">
                      <CalendarCheck size={12} />
                      {formatDate(slot.date)}
                      <span className="mx-1">·</span>
                      <Clock size={12} />
                      {slot.timeStart}–{slot.timeEnd}
                    </p>
                  </div>
                  {slot.isPaid ? (
                    <Badge variant="success">Оплачено</Badge>
                  ) : (
                    <Badge variant="warning">Не оплачено</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add slot dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Новий слот">
        <div className="space-y-4">
          <Input
            label="Дата"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Початок"
              type="time"
              value={timeStart}
              onChange={e => setTimeStart(e.target.value)}
              required
            />
            <Input
              label="Кінець"
              type="time"
              value={timeEnd}
              onChange={e => setTimeEnd(e.target.value)}
              required
            />
          </div>
          <Input
            label="Ціна (грн)"
            type="number"
            min="0"
            step="50"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="500"
            required
          />
          <button
            onClick={handleAddSlot}
            disabled={saving || !date || !timeStart || !timeEnd || !price}
            className="tr-btn-brand w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Збереження...' : 'Додати слот'}
          </button>
        </div>
      </Dialog>
    </div>
  )
}

// ─── Parent view ───────────────────────────────────────────────────────────────

function ParentView() {
  const { userModel } = useAuth()
  const { coaches, loading: coachesLoading } = useCoaches()
  const coachId = coaches[0]?.uid
  const { slots: available, loading: slotsLoading } = useAvailableSlots(coachId)
  const childId = userModel?.childIds?.[0]
  const { child } = useChildById(childId)
  const { slots: booked, loading: bookedLoading } = useChildBookedSlots(childId)
  const [requesting, setRequesting] = useState<string | null>(null)

  const handleRequest = async (slotId: string) => {
    if (!childId || !child || !userModel) return
    setRequesting(slotId)
    try {
      await requestSlot(slotId, childId, `${child.firstName} ${child.lastName}`, userModel.uid)
      toast.success('Запит надіслано')
    } catch {
      toast.error('Помилка надсилання запиту')
    } finally {
      setRequesting(null)
    }
  }

  const statusLabel: Record<string, string> = {
    requested: 'Очікує підтвердження',
    confirmed: 'Підтверджено',
    cancelled: 'Скасовано',
    available: 'Доступно',
  }

  const statusVariant: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
    requested: 'warning',
    confirmed: 'success',
    cancelled: 'error',
    available: 'default',
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-xl font-display font-bold text-[#F5F5F5]">Індивідуальні тренування</h1>

      {/* Available slots */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#9A9692] uppercase tracking-wider">Доступні слоти</h2>

        {coachesLoading || slotsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-[#12100F] animate-pulse" />)}
          </div>
        ) : available.length === 0 ? (
          <div className="py-10 text-center">
            <CalendarCheck size={36} className="mx-auto mb-3 text-[#34201A]" />
            <p className="text-sm text-[#9A9692]">Немає доступних слотів</p>
          </div>
        ) : (
          available.map(slot => (
            <div key={slot.id} className="tr-card-glow p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#F5F5F5] flex items-center gap-1.5 text-sm">
                  <CalendarCheck size={14} className="text-[#FF6A00]" />
                  {formatDate(slot.date)}
                </p>
                <p className="text-xs text-[#9A9692] flex items-center gap-1.5 mt-0.5">
                  <Clock size={12} />
                  {slot.timeStart}–{slot.timeEnd}
                  <span className="mx-1 text-[#34201A]">·</span>
                  <Banknote size={12} />
                  <span className="text-[#FFC400] font-semibold">{slot.price} грн</span>
                </p>
              </div>
              <button
                onClick={() => handleRequest(slot.id)}
                disabled={requesting === slot.id || !childId}
                className="tr-btn-brand text-sm px-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {requesting === slot.id ? 'Надсилання...' : 'Записатися'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Booked slots */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#9A9692] uppercase tracking-wider">Мої записи</h2>

        {bookedLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-[#12100F] animate-pulse" />)}
          </div>
        ) : booked.length === 0 ? (
          <p className="text-sm text-[#9A9692] text-center py-6">Немає активних записів</p>
        ) : (
          booked.map(slot => (
            <div key={slot.id} className="tr-card p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#F5F5F5] flex items-center gap-1.5">
                  <CalendarCheck size={13} className="text-[#9A9692]" />
                  {formatDate(slot.date)}
                </p>
                <p className="text-xs text-[#9A9692] flex items-center gap-1.5 mt-0.5">
                  <Clock size={12} />
                  {slot.timeStart}–{slot.timeEnd}
                  <span className="mx-1">·</span>
                  {slot.price} грн
                </p>
              </div>
              <Badge variant={statusVariant[slot.status] ?? 'default'}>
                {statusLabel[slot.status] ?? slot.status}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SlotsPage() {
  const { userModel } = useAuth()
  if (!userModel) return null
  return userModel.role === 'coach' ? <CoachView /> : <ParentView />
}
