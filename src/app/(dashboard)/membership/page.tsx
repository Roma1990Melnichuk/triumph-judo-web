'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useMemberships, useTariffs, saveMembership } from '@/lib/hooks/useMembership'
import { useChildren } from '@/lib/hooks/useChildren'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Dialog } from '@/components/ui/dialog'
import { CreditCard, Plus, Calendar, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import type { MembershipStatus } from '@/lib/types'

const STATUS_LABEL: Record<MembershipStatus, string> = {
  active: 'Активний', expired: 'Прострочений', pending: 'Очікує', cancelled: 'Скасований',
}
const STATUS_VARIANT: Record<MembershipStatus, 'success'|'error'|'warning'|'default'> = {
  active: 'success', expired: 'error', pending: 'warning', cancelled: 'default',
}

export default function MembershipPage() {
  const { userModel } = useAuth()
  const { memberships, loading } = useMemberships()
  const { tariffs } = useTariffs()
  const { children } = useChildren(userModel?.uid)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    childId: '', tariffId: '', startDate: new Date().toISOString().split('T')[0], amountPaid: '',
  })

  const selectedTariff = tariffs.find(t => t.id === form.tariffId)

  const endDate = useMemo(() => {
    if (!form.startDate || !selectedTariff) return null
    const d = new Date(form.startDate)
    d.setDate(d.getDate() + selectedTariff.duration)
    return d
  }, [form.startDate, selectedTariff])

  const childName = (childId: string) => {
    const c = children.find(ch => ch.id === childId)
    return c ? `${c.firstName} ${c.lastName}` : '—'
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.childId || !form.tariffId || !endDate) {
      toast.error('Заповніть всі поля')
      return
    }
    setSaving(true)
    try {
      const now = new Date()
      const status: MembershipStatus = new Date(form.startDate) <= now && endDate >= now ? 'active' : 'pending'
      await saveMembership({
        childId: form.childId,
        parentId: '',
        tariffId: form.tariffId,
        tariffName: selectedTariff?.name ?? '',
        startDate: new Date(form.startDate),
        endDate,
        status,
        amountPaid: parseFloat(form.amountPaid) || 0,
        paidAt: new Date(),
      })
      toast.success('Абонемент додано')
      setShowAdd(false)
      setForm({ childId: '', tariffId: '', startDate: new Date().toISOString().split('T')[0], amountPaid: '' })
    } catch {
      toast.error('Помилка')
    } finally {
      setSaving(false)
    }
  }

  // filter to this coach's children only
  const coachChildIds = new Set(children.map(c => c.id))
  if (userModel?.role !== 'coach') return <p className="text-[#746E68]">Тільки для тренерів</p>

  const myMemberships = memberships.filter(m => coachChildIds.has(m.childId))

  const active = myMemberships.filter(m => m.status === 'active')
  const other = myMemberships.filter(m => m.status !== 'active')

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F7F5F2]">Абонементи</h1>
          <p className="text-sm text-[#746E68]">{active.length} активних · {myMemberships.length} всього</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} className="mr-1" />Додати</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#63D728]">{active.length}</p>
            <p className="text-xs text-[#746E68] mt-1">Активних</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#FF8A00]">{myMemberships.filter(m => m.status === 'pending').length}</p>
            <p className="text-xs text-[#746E68] mt-1">Очікують</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#FF3B30]">{myMemberships.filter(m => m.status === 'expired').length}</p>
            <p className="text-xs text-[#746E68] mt-1">Прострочено</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-[#120605] animate-pulse" />)}</div>
      ) : myMemberships.length === 0 ? (
        <div className="p-10 text-center">
          <CreditCard size={32} className="mx-auto mb-3 text-[#746E68]" />
          <p className="text-sm text-[#746E68]">Абонементів поки немає</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...active, ...other].map(m => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[#120605] border border-[#2A1410]">
              <div className="size-9 rounded-xl bg-[#D50000]/10 flex items-center justify-center shrink-0">
                <CreditCard size={15} className="text-[#D50000]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#F7F5F2]">{childName(m.childId)}</p>
                  <Badge variant={STATUS_VARIANT[m.status]} className="text-[10px]">{STATUS_LABEL[m.status]}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-[#746E68]">{m.tariffName}</span>
                  <span className="flex items-center gap-1 text-xs text-[#746E68]">
                    <Calendar size={10} /> {formatDate(m.startDate)} — {formatDate(m.endDate)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#FFD21A]">{m.amountPaid} грн</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} title="Новий абонемент">
        <form onSubmit={handleAdd} className="space-y-4">
          <Select label="Спортсмен" value={form.childId} onChange={e => setForm(f => ({ ...f, childId: e.target.value }))} required>
            <option value="">Оберіть спортсмена...</option>
            {children.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
          </Select>
          <Select label="Тариф" value={form.tariffId} onChange={e => setForm(f => ({ ...f, tariffId: e.target.value }))} required>
            <option value="">Оберіть тариф...</option>
            {tariffs.map(t => <option key={t.id} value={t.id}>{t.name} — {t.price} грн ({t.duration} дн.)</option>)}
          </Select>
          {selectedTariff && (
            <p className="text-xs text-[#746E68] -mt-2">{selectedTariff.description}</p>
          )}
          <Input label="Дата початку" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
          {endDate && (
            <p className="text-xs text-[#B7B0A8]">Дата закінчення: <span className="text-[#FFD21A]">{formatDate(endDate)}</span></p>
          )}
          <Input label="Оплачено (грн)" type="number" value={form.amountPaid} onChange={e => setForm(f => ({ ...f, amountPaid: e.target.value }))} placeholder={selectedTariff?.price?.toString() ?? '0'} />
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Скасувати</Button>
            <Button type="submit" loading={saving}>Додати</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
