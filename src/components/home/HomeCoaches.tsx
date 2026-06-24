'use client'
import Link from 'next/link'
import { Users, ChevronRight } from 'lucide-react'
import { useCoaches } from '@/lib/hooks/useMessages'
import { Avatar } from '@/components/ui/avatar'

export function HomeCoaches() {
  const { coaches, loading } = useCoaches()

  return (
    <div className="rounded-[24px] p-5 flex flex-col gap-4"
         style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[#FF6A00]" />
          <span className="font-display font-black text-[#F5F5F5] text-base uppercase tracking-wide">Тренери</span>
        </div>
        <Link href="/team" className="text-[#FF6A00] text-xs font-semibold hover:text-[#FFC400] transition-colors flex items-center gap-1">
          ВСІ <ChevronRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-[#1A120F] animate-pulse" />)}
        </div>
      ) : coaches.length === 0 ? (
        <div className="text-center py-6 text-[#9A9692] text-sm">
          <Users size={28} className="mx-auto mb-2 opacity-30" />
          <p>Тренерів ще немає</p>
        </div>
      ) : (
        <div className="space-y-2">
          {coaches.slice(0, 3).map(coach => (
            <Link key={coach.uid} href={`/coaches/${coach.uid}`}
                 className="flex items-center gap-3 p-3 rounded-[14px] bg-[#1A120F] border border-[#2A1810] hover:border-[#3A2820] hover:bg-[#1F1510] transition-colors">
              <Avatar name={coach.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-[#F5F5F5] text-sm font-semibold truncate">{coach.name}</p>
                <p className="text-[#9A9692] text-[10px] uppercase tracking-wider mt-0.5">Тренер з дзюдо</p>
              </div>
              <ChevronRight size={14} className="text-[#9A9692] shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
