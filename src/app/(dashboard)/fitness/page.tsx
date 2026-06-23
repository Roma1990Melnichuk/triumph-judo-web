'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dumbbell, Zap, Wind, Flame, Plus, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const FITNESS_CATEGORIES = [
  { id: 'strength', name: 'Сила', icon: Dumbbell, color: '#D50000', progress: 65, exercises: 12, description: 'Присідання, підтягування, віджимання' },
  { id: 'endurance', name: 'Витривалість', icon: Flame, color: '#FF8A00', progress: 42, exercises: 8, description: 'Біг, стрибки, кола' },
  { id: 'flexibility', name: "Гнучкість", icon: Wind, color: '#29B6F6', progress: 78, exercises: 10, description: 'Розтяжка, міст, шпагат' },
  { id: 'speed', name: 'Швидкість', icon: Zap, color: '#FFD21A', progress: 55, exercises: 6, description: "Спринти, реакція, швидкість рук" },
]

export default function FitnessPage() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F7F5F2]">Фізична підготовка</h1>
          <p className="text-sm text-[#746E68]">Програми та завдання</p>
        </div>
        {isCoach && (
          <Button size="sm" onClick={() => toast('Розділ в розробці', { icon: '🚧' })}>
            <Plus size={14} className="mr-1" />Завдання
          </Button>
        )}
      </div>

      {/* Coming Soon Banner */}
      <Card className="border-[#FFD21A]/20 bg-gradient-to-r from-[#120605] to-[#1B0A08]">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#FFD21A]/10 flex items-center justify-center shrink-0">
              <Dumbbell size={20} className="text-[#FFD21A]" />
            </div>
            <div>
              <p className="font-semibold text-[#F7F5F2]">Розділ в розробці</p>
              <p className="text-sm text-[#746E68]">Незабаром тут з'являться персональні програми тренувань та завдання</p>
            </div>
            <Badge variant="warning" className="ml-auto shrink-0">Скоро</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FITNESS_CATEGORIES.map(cat => {
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              onClick={() => toast(`${cat.name}: ${cat.description}`, { icon: '💪' })}
              className="p-4 rounded-2xl bg-[#120605] border border-[#2A1410] hover:border-opacity-60 text-left transition-all hover:scale-[1.01] group"
              style={{ '--hover-color': cat.color } as React.CSSProperties}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="size-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}15` }}>
                  <Icon size={18} style={{ color: cat.color }} />
                </div>
                <ChevronRight size={16} className="text-[#746E68] group-hover:text-[#F7F5F2] transition-colors" />
              </div>
              <p className="font-semibold text-[#F7F5F2] mb-0.5">{cat.name}</p>
              <p className="text-xs text-[#746E68] mb-3">{cat.exercises} вправ</p>
              <div className="h-1.5 rounded-full bg-[#1B0A08] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${cat.progress}%`, backgroundColor: cat.color }} />
              </div>
              <p className="text-xs text-[#746E68] mt-1">{cat.progress}% виконано</p>
            </button>
          )
        })}
      </div>

      {/* Placeholder assignments */}
      <div>
        <h2 className="font-semibold text-[#F7F5F2] mb-3">Активні завдання</h2>
        <div className="p-8 rounded-2xl bg-[#120605] border border-[#2A1410] border-dashed text-center">
          <Dumbbell size={28} className="mx-auto mb-2 text-[#2A1410]" />
          <p className="text-sm text-[#746E68]">Завдань поки немає</p>
          {isCoach && (
            <Button size="sm" variant="ghost" className="mt-3" onClick={() => toast('Розділ в розробці', { icon: '🚧' })}>
              Створити перше завдання
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
