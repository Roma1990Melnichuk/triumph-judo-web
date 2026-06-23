'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useChildById, saveChild, deleteChild } from '@/lib/hooks/useChildren'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Dialog } from '@/components/ui/dialog'
import { BELT_LEVELS, BELT_DISPLAY, WEIGHT_CATEGORIES } from '@/lib/constants'
import { ArrowLeft, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { BeltLevel, Gender } from '@/lib/types'

export default function EditAthletePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { userModel } = useAuth()
  const router = useRouter()
  const { child, loading } = useChildById(id)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', birthYear: 2010,
    weightCategory: '-30 кг', currentBelt: 'white' as BeltLevel,
    gender: 'male' as Gender, phone: '',
  })

  useEffect(() => {
    if (child) {
      setForm({
        firstName: child.firstName,
        lastName: child.lastName,
        birthYear: child.birthYear,
        weightCategory: child.weightCategory,
        currentBelt: child.currentBelt,
        gender: child.gender ?? 'male',
        phone: child.phone ?? '',
      })
    }
  }, [child])

  if (userModel?.role !== 'coach') return <p className="text-[#746E68]">Тільки для тренерів</p>

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!child) return
    setSaving(true)
    try {
      await saveChild({
        ...child,
        ...form,
      })
      toast.success('Збережено')
      router.push(`/team/${id}`)
    } catch {
      toast.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteChild(id)
      toast.success('Спортсмена видалено')
      router.push('/team')
    } catch {
      toast.error('Помилка видалення')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="max-w-lg space-y-3">
      {[...Array(6)].map((_, i) => <div key={i} className="h-12 rounded-2xl bg-[#120605] animate-pulse" />)}
    </div>
  )

  if (!child) return <p className="text-sm text-[#746E68]">Спортсмена не знайдено</p>

  return (
    <div className="max-w-lg">
      <Link href={`/team/${id}`} className="flex items-center gap-1.5 text-sm text-[#746E68] hover:text-[#F7F5F2] mb-4 transition-colors">
        <ArrowLeft size={14} /> Назад
      </Link>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-[#F7F5F2]">Редагування</h1>
        <button
          onClick={() => setShowDelete(true)}
          className="flex items-center gap-1.5 text-sm text-[#746E68] hover:text-[#FF3B30] transition-colors"
        >
          <Trash2 size={14} /> Видалити
        </button>
      </div>
      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Ім'я" value={form.firstName} onChange={e => set('firstName', e.target.value)} required placeholder="Іван" />
              <Input label="Прізвище" value={form.lastName} onChange={e => set('lastName', e.target.value)} required placeholder="Петренко" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Рік народження" type="number" value={form.birthYear} onChange={e => set('birthYear', parseInt(e.target.value))} required min={2000} max={new Date().getFullYear()} />
              <Select label="Стать" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="male">Чоловіча</option>
                <option value="female">Жіноча</option>
              </Select>
            </div>
            <Select label="Категорія ваги" value={form.weightCategory} onChange={e => set('weightCategory', e.target.value)}>
              {WEIGHT_CATEGORIES.map(w => <option key={w} value={w}>{w}</option>)}
            </Select>
            <Select label="Поточний пояс" value={form.currentBelt} onChange={e => set('currentBelt', e.target.value as BeltLevel)}>
              {BELT_LEVELS.map(b => <option key={b} value={b}>{BELT_DISPLAY[b]}</option>)}
            </Select>
            <Input label="Телефон" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+380..." type="tel" />
            <div className="flex gap-2 pt-2">
              <Link href={`/team/${id}`} className="flex-1">
                <Button variant="ghost" className="w-full" type="button">Скасувати</Button>
              </Link>
              <Button type="submit" loading={saving} className="flex-1">Зберегти</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showDelete} onClose={() => setShowDelete(false)} title="Видалити спортсмена?">
        <p className="text-sm text-[#B7B0A8] mb-5">Цю дію неможливо скасувати. Всі дані спортсмена будуть видалені.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setShowDelete(false)}>Скасувати</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Видалити</Button>
        </div>
      </Dialog>
    </div>
  )
}
