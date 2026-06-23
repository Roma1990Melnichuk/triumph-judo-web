'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { saveChild } from '@/lib/hooks/useChildren'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { BELT_LEVELS, BELT_DISPLAY, WEIGHT_CATEGORIES } from '@/lib/constants'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import type { BeltLevel, Gender } from '@/lib/types'

export default function AddAthlePage() {
  const { userModel } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    birthYear: new Date().getFullYear() - 10,
    weightCategory: '-30 кг',
    currentBelt: 'white' as BeltLevel,
    gender: 'male' as Gender,
    phone: '',
  })

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userModel) return
    setSaving(true)
    try {
      const id = await saveChild({
        ...form,
        coachId: userModel.uid,
        coachName: userModel.name,
        totalPoints: 0,
        bonusPoints: 0,
        beltReady: false,
        clubId: userModel.clubId,
      })
      toast.success('Спортсмена додано')
      router.push(`/team/${id}`)
    } catch {
      toast.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg">
      <Link href="/team" className="flex items-center gap-1.5 text-sm text-[#746E68] hover:text-[#F7F5F2] mb-4 transition-colors">
        <ArrowLeft size={14} /> Назад
      </Link>
      <h1 className="text-lg font-bold text-[#F7F5F2] mb-4">Новий спортсмен</h1>
      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Ім'я"
                value={form.firstName}
                onChange={e => set('firstName', e.target.value)}
                required
                placeholder="Іван"
              />
              <Input
                label="Прізвище"
                value={form.lastName}
                onChange={e => set('lastName', e.target.value)}
                required
                placeholder="Петренко"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Рік народження"
                type="number"
                value={form.birthYear}
                onChange={e => set('birthYear', parseInt(e.target.value))}
                required
                min={2000}
                max={new Date().getFullYear()}
              />
              <Select
                label="Стать"
                value={form.gender}
                onChange={e => set('gender', e.target.value)}
              >
                <option value="male">Чоловіча</option>
                <option value="female">Жіноча</option>
              </Select>
            </div>

            <Select
              label="Категорія ваги"
              value={form.weightCategory}
              onChange={e => set('weightCategory', e.target.value)}
            >
              {WEIGHT_CATEGORIES.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </Select>

            <Select
              label="Поточний пояс"
              value={form.currentBelt}
              onChange={e => set('currentBelt', e.target.value as BeltLevel)}
            >
              {BELT_LEVELS.map(b => (
                <option key={b} value={b}>{BELT_DISPLAY[b]}</option>
              ))}
            </Select>

            <Input
              label="Телефон (необов'язково)"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+380..."
              type="tel"
            />

            <div className="flex gap-2 pt-2">
              <Link href="/team" className="flex-1">
                <Button variant="ghost" className="w-full">Скасувати</Button>
              </Link>
              <Button type="submit" loading={saving} className="flex-1">Зберегти</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
