'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useChildren, useChildById } from '@/lib/hooks/useChildren'
import { useChildAchievements, grantAchievement, revokeAchievement } from '@/lib/hooks/useAchievements'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ACHIEVEMENT_DEFS, RARITY_COLOR, RARITY_LABEL } from '@/lib/constants'
import { Star, Trophy, X, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import type { AchievementDef } from '@/lib/types'

function AchievementCard({ def, earned, onRevoke, isCoach }: {
  def: AchievementDef
  earned?: { earnedAt: Date; note?: string }
  onRevoke?: () => void
  isCoach?: boolean
}) {
  const color = RARITY_COLOR[def.rarity]
  return (
    <div className={`relative p-3 rounded-2xl border transition-all ${earned ? 'bg-[#120605] border-[#2A1410]' : 'bg-[#0A0302] border-[#1B0A08] opacity-40'}`}>
      {earned && isCoach && onRevoke && (
        <button onClick={onRevoke} className="absolute top-2 right-2 p-1 text-[#746E68] hover:text-[#FF3B30] transition-colors">
          <X size={12} />
        </button>
      )}
      <div className="text-2xl mb-2">{def.emoji}</div>
      <p className="text-xs font-semibold text-[#F7F5F2] leading-tight">{def.name}</p>
      <p className="text-[10px] text-[#746E68] mt-0.5 leading-tight line-clamp-2">{def.description}</p>
      <div className="mt-2">
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ color, backgroundColor: `${color}20` }}>
          {RARITY_LABEL[def.rarity]}
        </span>
      </div>
      {earned && <p className="text-[10px] text-[#746E68] mt-1">{formatDate(earned.earnedAt)}</p>}
    </div>
  )
}

function ParentAchievementsView() {
  const { userModel } = useAuth()
  const childId = userModel?.childIds?.[0]
  const { child } = useChildById(childId)
  const { earned, loading } = useChildAchievements(childId)
  const [filter, setFilter] = useState<string>('all')

  const earnedMap = new Map(earned.map(e => [e.achievementId, e]))

  const filtered = ACHIEVEMENT_DEFS.filter(d => {
    if (d.isHidden && !earnedMap.has(d.id)) return false
    if (filter === 'earned') return earnedMap.has(d.id)
    if (filter === 'locked') return !earnedMap.has(d.id)
    return true
  })

  if (loading) return <div className="h-40 rounded-2xl bg-[#120605] animate-pulse" />

  return (
    <div className="space-y-4">
      {child && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#120605] border border-[#2A1410]">
          <Avatar name={`${child.firstName} ${child.lastName}`} photoUrl={child.photoUrl} size="lg" />
          <div>
            <p className="font-semibold text-[#F7F5F2]">{child.firstName} {child.lastName}</p>
            <p className="text-sm text-[#746E68]">{earned.length} нагород</p>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        {(['all','earned','locked'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${filter === f ? 'bg-[#D50000] text-white' : 'bg-[#1B0A08] text-[#B7B0A8] hover:bg-[#2A1410]'}`}>
            {f === 'all' ? 'Всі' : f === 'earned' ? 'Отримані' : 'Заблоковані'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {filtered.map(def => (
          <AchievementCard key={def.id} def={def} earned={earnedMap.get(def.id)} />
        ))}
      </div>
    </div>
  )
}

function CoachAchievementsView() {
  const { userModel } = useAuth()
  const { children, loading: childrenLoading } = useChildren(userModel?.uid)
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const { earned, loading: earnedLoading } = useChildAchievements(selectedChildId || undefined)
  const [showGrant, setShowGrant] = useState(false)
  const [grantNote, setGrantNote] = useState('')
  const [selectedDef, setSelectedDef] = useState<AchievementDef | null>(null)
  const [granting, setGranting] = useState(false)
  const [search, setSearch] = useState('')

  const earnedMap = new Map(earned.map(e => [e.achievementId, e]))

  const handleGrant = async () => {
    if (!selectedDef || !selectedChildId || !userModel) return
    setGranting(true)
    try {
      await grantAchievement(selectedChildId, selectedDef.id, userModel.uid, grantNote || undefined)
      toast.success('Нагороду видано!')
      setShowGrant(false)
      setSelectedDef(null)
      setGrantNote('')
    } catch {
      toast.error('Помилка')
    } finally {
      setGranting(false)
    }
  }

  const handleRevoke = async (achievementId: string) => {
    if (!selectedChildId) return
    try {
      await revokeAchievement(selectedChildId, achievementId)
      toast.success('Нагороду скасовано')
    } catch {
      toast.error('Помилка')
    }
  }

  const filteredDefs = ACHIEVEMENT_DEFS.filter(d => !d.isHidden || earnedMap.has(d.id))
    .filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Select value={selectedChildId} onChange={e => setSelectedChildId(e.target.value)} className="max-w-xs">
          <option value="">Оберіть спортсмена...</option>
          {children.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
        </Select>
        {selectedChildId && (
          <Button size="sm" onClick={() => setShowGrant(true)}><Plus size={14} className="mr-1" />Видати нагороду</Button>
        )}
      </div>

      {!selectedChildId ? (
        <div className="p-10 text-center">
          <Trophy size={32} className="mx-auto mb-3 text-[#746E68]" />
          <p className="text-sm text-[#746E68]">Оберіть спортсмена для перегляду нагород</p>
        </div>
      ) : earnedLoading ? (
        <div className="h-40 rounded-2xl bg-[#120605] animate-pulse" />
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Star size={16} className="text-[#FFD21A]" />
            <span className="text-sm text-[#B7B0A8]">{earned.length} нагород отримано</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {filteredDefs.map(def => (
              <AchievementCard
                key={def.id}
                def={def}
                earned={earnedMap.get(def.id)}
                isCoach
                onRevoke={earnedMap.has(def.id) ? () => handleRevoke(def.id) : undefined}
              />
            ))}
          </div>
        </>
      )}

      <Dialog open={showGrant} onClose={() => { setShowGrant(false); setSelectedDef(null); setGrantNote('') }} title="Видати нагороду">
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#746E68]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Пошук нагороди..." className="w-full h-9 pl-8 pr-3 rounded-xl bg-[#1B0A08] border border-[#2A1410] text-sm text-[#F7F5F2] placeholder-[#746E68] focus:outline-none focus:border-[#FFD21A]" />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {ACHIEVEMENT_DEFS.filter(d => !earnedMap.has(d.id) && d.name.toLowerCase().includes(search.toLowerCase())).map(def => (
              <button key={def.id} onClick={() => setSelectedDef(def)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left ${selectedDef?.id === def.id ? 'bg-[#D50000]/20 border border-[#D50000]/40' : 'hover:bg-[#1B0A08]'}`}>
                <span className="text-xl">{def.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#F7F5F2]">{def.name}</p>
                  <p className="text-xs text-[#746E68] truncate">{def.description}</p>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ color: RARITY_COLOR[def.rarity], backgroundColor: `${RARITY_COLOR[def.rarity]}20` }}>
                  {RARITY_LABEL[def.rarity]}
                </span>
              </button>
            ))}
          </div>
          {selectedDef && (
            <Input label="Примітка (необов'язково)" value={grantNote} onChange={e => setGrantNote(e.target.value)} placeholder="Причина нагороди..." />
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowGrant(false)}>Скасувати</Button>
            <Button loading={granting} disabled={!selectedDef} onClick={handleGrant}>Видати</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default function AchievementsPage() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#F7F5F2]">Нагороди</h1>
      {isCoach ? <CoachAchievementsView /> : <ParentAchievementsView />}
    </div>
  )
}
