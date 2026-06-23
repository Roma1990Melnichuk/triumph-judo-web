'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useChildren, useChildById } from '@/lib/hooks/useChildren'
import { useAllCompetitions, useChildCompetitions, saveCompetitionResult, deleteCompetitionResult } from '@/lib/hooks/useCompetitions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Dialog } from '@/components/ui/dialog'
import { WEIGHT_CATEGORIES } from '@/lib/constants'
import { Trophy, Medal, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import type { MedalType } from '@/lib/types'

const MEDAL_EMOJI: Record<MedalType, string> = { gold: '🥇', silver: '🥈', bronze: '🥉', none: '' }
const MEDAL_LABEL: Record<MedalType, string> = { gold: 'Золото', silver: 'Срібло', bronze: 'Бронза', none: 'Без медалі' }

function MedalBadge({ medal }: { medal: MedalType }) {
  if (medal === 'none') return null
  const variants = { gold: 'gold', silver: 'default', bronze: 'warning' } as const
  return (
    <Badge variant={variants[medal] ?? 'default'}>
      {MEDAL_EMOJI[medal]} {MEDAL_LABEL[medal]}
    </Badge>
  )
}

function MedalSummary({ results }: { results: Array<{ medal: MedalType }> }) {
  const gold = results.filter(r => r.medal === 'gold').length
  const silver = results.filter(r => r.medal === 'silver').length
  const bronze = results.filter(r => r.medal === 'bronze').length
  return (
    <div className="flex gap-3">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFD21A]/10">
        <span>🥇</span><span className="font-bold text-[#FFD21A]">{gold}</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B7B0A8]/10">
        <span>🥈</span><span className="font-bold text-[#B7B0A8]">{silver}</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF8A00]/10">
        <span>🥉</span><span className="font-bold text-[#FF8A00]">{bronze}</span>
      </div>
    </div>
  )
}

function AddResultDialog({ open, onClose, children, coachId }: {
  open: boolean; onClose: () => void; children: Array<{ id: string; firstName: string; lastName: string }>; coachId: string
}) {
  const [form, setForm] = useState({
    childId: '', competitionName: '', date: new Date().toISOString().split('T')[0],
    place: 1, medal: 'none' as MedalType, weight: '-30 кг', points: 0, notes: '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.childId || !form.competitionName.trim()) return
    setSaving(true)
    try {
      await saveCompetitionResult({
        ...form,
        date: new Date(form.date),
        coachId,
      })
      toast.success('Результат додано')
      onClose()
      setForm({ childId: '', competitionName: '', date: new Date().toISOString().split('T')[0], place: 1, medal: 'none', weight: '-30 кг', points: 0, notes: '' })
    } catch {
      toast.error('Помилка')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Новий результат">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Select label="Спортсмен" value={form.childId} onChange={e => setForm(f => ({ ...f, childId: e.target.value }))} required>
          <option value="">Оберіть...</option>
          {children.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
        </Select>
        <Input label="Турнір" value={form.competitionName} onChange={e => setForm(f => ({ ...f, competitionName: e.target.value }))} required placeholder="Назва турніру" />
        <Input label="Дата" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Місце" type="number" min={1} value={form.place} onChange={e => setForm(f => ({ ...f, place: parseInt(e.target.value) }))} />
          <Select label="Медаль" value={form.medal} onChange={e => setForm(f => ({ ...f, medal: e.target.value as MedalType }))}>
            {(Object.keys(MEDAL_LABEL) as MedalType[]).map(m => <option key={m} value={m}>{MEDAL_LABEL[m]}</option>)}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Категорія ваги" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}>
            {WEIGHT_CATEGORIES.map(w => <option key={w} value={w}>{w}</option>)}
          </Select>
          <Input label="Очки" type="number" min={0} value={form.points} onChange={e => setForm(f => ({ ...f, points: parseInt(e.target.value) }))} />
        </div>
        <Input label="Примітки" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Коментар..." />
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="ghost" type="button" onClick={onClose}>Скасувати</Button>
          <Button type="submit" loading={saving}>Зберегти</Button>
        </div>
      </form>
    </Dialog>
  )
}

function CoachView() {
  const { userModel } = useAuth()
  const { children } = useChildren(userModel?.uid)
  const { results, loading } = useAllCompetitions(userModel?.uid)
  const [showAdd, setShowAdd] = useState(false)

  const handleDelete = async (id: string) => {
    try {
      await deleteCompetitionResult(id)
      toast.success('Видалено')
    } catch {
      toast.error('Помилка')
    }
  }

  const childName = (childId: string) => {
    const c = children.find(ch => ch.id === childId)
    return c ? `${c.firstName} ${c.lastName}` : '—'
  }

  if (loading) return <div className="h-40 rounded-2xl bg-[#120605] animate-pulse" />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <MedalSummary results={results} />
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} className="mr-1" />Додати</Button>
      </div>
      {results.length === 0 ? (
        <div className="p-10 text-center">
          <Trophy size={32} className="mx-auto mb-3 text-[#746E68]" />
          <p className="text-sm text-[#746E68]">Результатів поки немає</p>
        </div>
      ) : (
        <div className="space-y-2">
          {results.map(r => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[#120605] border border-[#2A1410]">
              <div className="text-2xl w-8 text-center">{MEDAL_EMOJI[r.medal] || `#${r.place}`}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#F7F5F2]">{r.competitionName}</p>
                <p className="text-xs text-[#746E68]">{childName(r.childId)} · {formatDate(r.date)} · {r.weight}</p>
              </div>
              <MedalBadge medal={r.medal} />
              <span className="text-sm font-bold text-[#FFD21A]">{r.points}б</span>
              <button onClick={() => handleDelete(r.id)} className="p-1 text-[#746E68] hover:text-[#FF3B30] transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
      <AddResultDialog open={showAdd} onClose={() => setShowAdd(false)} children={children} coachId={userModel?.uid ?? ''} />
    </div>
  )
}

function ParentView() {
  const { userModel } = useAuth()
  const childId = userModel?.childIds?.[0]
  const { child } = useChildById(childId)
  const { results, loading } = useChildCompetitions(childId)

  if (loading) return <div className="h-40 rounded-2xl bg-[#120605] animate-pulse" />

  return (
    <div className="space-y-4">
      {child && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#120605] border border-[#2A1410]">
          <Avatar name={`${child.firstName} ${child.lastName}`} photoUrl={child.photoUrl} size="md" />
          <div>
            <p className="font-semibold text-[#F7F5F2]">{child.firstName} {child.lastName}</p>
            <p className="text-sm text-[#746E68]">{results.length} результатів</p>
          </div>
          <div className="ml-auto">
            <MedalSummary results={results} />
          </div>
        </div>
      )}
      {results.length === 0 ? (
        <p className="text-sm text-[#746E68]">Результатів поки немає</p>
      ) : (
        <div className="space-y-2">
          {results.map(r => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[#120605] border border-[#2A1410]">
              <div className="text-2xl w-8 text-center">{MEDAL_EMOJI[r.medal] || `#${r.place}`}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#F7F5F2]">{r.competitionName}</p>
                <p className="text-xs text-[#746E68]">{formatDate(r.date)} · {r.weight}</p>
                {r.notes && <p className="text-xs text-[#746E68] mt-0.5">{r.notes}</p>}
              </div>
              <div className="text-right">
                <MedalBadge medal={r.medal} />
                <p className="text-sm font-bold text-[#FFD21A] mt-1">{r.points}б</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CompetitionsPage() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'
  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-lg font-bold text-[#F7F5F2]">Змагання</h1>
      {isCoach ? <CoachView /> : <ParentView />}
    </div>
  )
}
