'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useHonorBoard, saveHonorEntry, deleteHonorEntry, HonorBoardEntryDoc } from '@/lib/hooks/useAttendance'
import { useChildren } from '@/lib/hooks/useChildren'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { BeltBadge } from '@/components/ui/belt-badge'
import { Trophy, Pin, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { BeltLevel } from '@/lib/types'

type MedalFilter = 'all' | 'gold' | 'silver' | 'bronze' | 'other'

const TYPE_LABELS: Record<string, string> = {
  medals: 'Медалі',
  belt: 'Пояс',
  progress: 'Прогрес',
  record: 'Рекорд',
  performance: 'Результат',
  milestone: 'Milestone',
  special: 'Особливе',
  seasonal: 'Сезонне',
}

function medalEmoji(entry: HonorBoardEntryDoc): string {
  if (entry.type === 'medals') {
    if (entry.medalType === 'gold') return '🥇'
    if (entry.medalType === 'silver') return '🥈'
    if (entry.medalType === 'bronze') return '🥉'
  }
  if (entry.type === 'belt') return '🥋'
  if (entry.type === 'record') return '📈'
  if (entry.type === 'progress') return '⭐'
  if (entry.type === 'performance') return '🎯'
  if (entry.type === 'milestone') return '🏆'
  if (entry.type === 'seasonal') return '🗓️'
  return '🏅'
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })
}

const BELT_LEVELS: BeltLevel[] = [
  'white', 'whiteYellow', 'yellow', 'yellowOrange', 'orange',
  'orangeGreen', 'green', 'greenBlue', 'blue', 'blueBrown', 'brown', 'black',
]

const BELT_DISPLAY: Record<BeltLevel, string> = {
  white: 'Білий',
  whiteYellow: 'Біло-жовтий',
  yellow: 'Жовтий',
  yellowOrange: 'Жовто-помаранчевий',
  orange: 'Помаранчевий',
  orangeGreen: 'Помаранчево-зелений',
  green: 'Зелений',
  greenBlue: 'Зелено-синій',
  blue: 'Синій',
  blueBrown: 'Синьо-коричневий',
  brown: 'Коричневий',
  black: 'Чорний',
}

interface AddFormState {
  athleteId: string
  athleteName: string
  athleteBelt: string
  type: string
  title: string
  description: string
  competitionName: string
  medalType: '' | 'gold' | 'silver' | 'bronze'
  isPinned: boolean
}

const EMPTY_FORM: AddFormState = {
  athleteId: '',
  athleteName: '',
  athleteBelt: '',
  type: 'medals',
  title: '',
  description: '',
  competitionName: '',
  medalType: '',
  isPinned: false,
}

export default function HonorBoardPage() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'

  const { entries, loading } = useHonorBoard()
  const { children } = useChildren(isCoach ? userModel?.uid : undefined)

  const [filter, setFilter] = useState<MedalFilter>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<AddFormState>(EMPTY_FORM)
  const [athleteSearch, setAthleteSearch] = useState('')
  const [showAthleteDropdown, setShowAthleteDropdown] = useState(false)

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return entries
    if (filter === 'other') return entries.filter(e => e.type !== 'medals' || !e.medalType)
    return entries.filter(e => e.medalType === filter)
  }, [entries, filter])

  const filteredAthletes = useMemo(() => {
    if (!athleteSearch.trim()) return children.slice(0, 8)
    const q = athleteSearch.toLowerCase()
    return children
      .filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(q))
      .slice(0, 8)
  }, [children, athleteSearch])

  const selectAthlete = (c: { id: string; firstName: string; lastName: string; currentBelt: BeltLevel }) => {
    setForm(f => ({
      ...f,
      athleteId: c.id,
      athleteName: `${c.firstName} ${c.lastName}`,
      athleteBelt: c.currentBelt,
    }))
    setAthleteSearch(`${c.firstName} ${c.lastName}`)
    setShowAthleteDropdown(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.athleteId) { toast.error('Оберіть спортсмена'); return }
    if (!form.title.trim()) { toast.error('Введіть заголовок'); return }
    setSaving(true)
    try {
      await saveHonorEntry({
        athleteId: form.athleteId,
        athleteName: form.athleteName,
        athleteBelt: form.athleteBelt || undefined,
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        competitionName: form.competitionName.trim() || undefined,
        medalType: form.medalType || undefined,
        isPinned: form.isPinned,
        isVisible: true,
        publishedAt: new Date(),
      })
      toast.success('Запис додано')
      setShowAdd(false)
      setForm(EMPTY_FORM)
      setAthleteSearch('')
    } catch {
      toast.error('Помилка')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити запис?')) return
    try {
      await deleteHonorEntry(id)
      toast.success('Видалено')
    } catch {
      toast.error('Помилка')
    }
  }

  // Split into two columns for masonry-like layout
  const col1 = filteredEntries.filter((_, i) => i % 2 === 0)
  const col2 = filteredEntries.filter((_, i) => i % 2 === 1)

  const renderCard = (entry: HonorBoardEntryDoc) => (
    <div
      key={entry.id}
      className={`tr-card p-4 mb-3 ${entry.isPinned ? 'border-[#FFC400]/30' : ''}`}
      style={entry.isPinned ? { borderColor: 'rgba(255,196,0,0.3)' } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl leading-none shrink-0">{medalEmoji(entry)}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-bold text-[#F5F5F5] leading-tight">{entry.athleteName}</p>
              {entry.isPinned && (
                <Pin size={11} className="text-[#FFC400] shrink-0" />
              )}
            </div>
            {entry.athleteBelt && (
              <div className="mt-0.5">
                <BeltBadge belt={entry.athleteBelt as BeltLevel} size="sm" showName />
              </div>
            )}
          </div>
        </div>
        {isCoach && (
          <button
            onClick={() => handleDelete(entry.id)}
            className="text-[#9A9692] hover:text-[#E30613] transition-colors shrink-0 ml-1"
            aria-label="Видалити"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <p className="text-sm font-semibold text-[#F5F5F5] mt-2 leading-snug">{entry.title}</p>

      {entry.description && (
        <p className="text-xs text-[#9A9692] mt-1 leading-relaxed">{entry.description}</p>
      )}

      {entry.competitionName && (
        <p className="text-xs text-[#FF6A00] italic mt-1">{entry.competitionName}</p>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#34201A]">
        <span className="text-[10px] text-[#9A9692] bg-[#1A120F] rounded-full px-2 py-0.5">
          {TYPE_LABELS[entry.type] ?? entry.type}
        </span>
        <span className="text-[10px] text-[#9A9692]">{formatDate(entry.publishedAt)}</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy size={22} className="text-[#FFC400] shrink-0" />
          <h1 className="text-2xl font-display font-black text-[#F5F5F5]">Дошка пошани</h1>
        </div>
        {isCoach && (
          <button
            onClick={() => setShowAdd(true)}
            className="tr-btn-brand px-4 h-10 text-sm font-bold flex items-center gap-2 shrink-0"
          >
            <Plus size={16} /> Додати запис
          </button>
        )}
      </div>

      {/* Medal filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(['all', 'gold', 'silver', 'bronze', 'other'] as MedalFilter[]).map(f => {
          const labels: Record<MedalFilter, string> = {
            all: 'Усі',
            gold: '🥇 Золото',
            silver: '🥈 Срібло',
            bronze: '🥉 Бронза',
            other: '🏅 Інше',
          }
          const active = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                active
                  ? 'text-white'
                  : 'bg-[#12100F] text-[#9A9692] border border-[#34201A] hover:bg-[#1A120F]'
              }`}
              style={active ? { background: 'linear-gradient(90deg,#E30613 0%,#FF6A00 58%,#FFC400 100%)' } : undefined}
            >
              {labels[f]}
            </button>
          )
        })}
      </div>

      {/* Grid / masonry */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-[24px] bg-[#12100F] animate-pulse" />
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="tr-card p-12 text-center">
          <Trophy size={36} className="mx-auto mb-3 text-[#9A9692]" />
          <p className="text-sm text-[#9A9692]">Поки що немає записів</p>
        </div>
      ) : (
        <>
          {/* Mobile: 2-col, desktop: 3-col masonry */}
          <div className="hidden lg:grid lg:grid-cols-3 lg:gap-3 items-start">
            {[col1, col2, filteredEntries.filter((_, i) => i % 3 === 2)].map((col, ci) => (
              <div key={ci}>
                {filteredEntries.filter((_, i) => i % 3 === ci).map(renderCard)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 lg:hidden items-start">
            <div>{col1.map(renderCard)}</div>
            <div>{col2.map(renderCard)}</div>
          </div>
        </>
      )}

      {/* Add entry dialog */}
      <Dialog open={showAdd} onClose={() => { setShowAdd(false); setForm(EMPTY_FORM); setAthleteSearch('') }} title="Новий запис">
        <form onSubmit={handleSave} className="space-y-4">
          {/* Athlete search */}
          <div className="relative">
            <Input
              label="Спортсмен"
              value={athleteSearch}
              onChange={e => {
                setAthleteSearch(e.target.value)
                setShowAthleteDropdown(true)
                if (!e.target.value) setForm(f => ({ ...f, athleteId: '', athleteName: '', athleteBelt: '' }))
              }}
              onFocus={() => setShowAthleteDropdown(true)}
              placeholder="Пошук за іменем..."
              required
            />
            {showAthleteDropdown && filteredAthletes.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1A120F] border border-[#34201A] rounded-[16px] overflow-hidden shadow-xl">
                {filteredAthletes.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectAthlete(c)}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#34201A] transition-colors flex items-center gap-2"
                  >
                    <span className="text-sm text-[#F5F5F5] font-medium">{c.firstName} {c.lastName}</span>
                    <BeltBadge belt={c.currentBelt} size="sm" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <Select
            label="Тип"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          >
            {Object.entries(TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>

          <Input
            label="Заголовок"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="1 місце на чемпіонаті..."
            required
          />

          <Input
            label="Опис (необов'язково)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Додаткова інформація..."
          />

          <Input
            label="Назва змагань (необов'язково)"
            value={form.competitionName}
            onChange={e => setForm(f => ({ ...f, competitionName: e.target.value }))}
            placeholder="Чемпіонат України 2026..."
          />

          {form.type === 'medals' && (
            <Select
              label="Тип медалі"
              value={form.medalType}
              onChange={e => setForm(f => ({ ...f, medalType: e.target.value as AddFormState['medalType'] }))}
            >
              <option value="">— без медалі —</option>
              <option value="gold">🥇 Золото</option>
              <option value="silver">🥈 Срібло</option>
              <option value="bronze">🥉 Бронза</option>
            </Select>
          )}

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setForm(f => ({ ...f, isPinned: !f.isPinned }))}
              className={`w-10 h-6 rounded-full transition-all relative ${
                form.isPinned ? 'bg-[#FFC400]' : 'bg-[#34201A]'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  form.isPinned ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-sm text-[#9A9692]">Закріпити запис</span>
          </label>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" type="button" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); setAthleteSearch('') }}>
              Скасувати
            </Button>
            <Button type="submit" loading={saving}>Зберегти</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
