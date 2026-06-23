'use client'
import { useState } from 'react'
import { History, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useChildById } from '@/lib/hooks/useChildren'
import { useXPHistory } from '@/lib/hooks/useXP'
import { XP_SOURCE_ICON, XP_SOURCE_LABEL } from '@/lib/constants'
import type { XpSource } from '@/lib/types'

const FILTERS: { label: string; value: XpSource | 'all' }[] = [
  { label: 'Всі', value: 'all' },
  { label: 'Тренування', value: 'attendance' },
  { label: 'Вправи', value: 'exercise' },
  { label: 'Харчування', value: 'nutrition' },
  { label: 'Змагання', value: 'competition' },
  { label: 'Ручні', value: 'manual' },
]

export default function XPHistoryPage() {
  const { userModel } = useAuth()
  const childId = userModel?.childIds?.[0]
  const { child } = useChildById(childId)
  const { transactions, loading } = useXPHistory(childId, 200)
  const [filter, setFilter] = useState<XpSource | 'all'>('all')

  const filtered = filter === 'all' ? transactions : transactions.filter(tx => tx.source === filter)

  const grouped: Record<string, typeof transactions> = {}
  filtered.forEach(tx => {
    const key = tx.createdAt.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(tx)
  })

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/loyalty" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <History size={18} className="text-[#FF6A00]" />
        <h1 className="text-xl font-display font-black text-white">Історія XP</h1>
        {child && (
          <span className="ml-auto text-sm font-bold text-[#FFD21A]">{child.totalPoints.toLocaleString('uk')} XP</span>
        )}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    filter === f.value
                      ? 'bg-[#FF6A00] text-white'
                      : 'bg-[#1A120F] text-white/50 hover:text-white/80'
                  }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-[#100C0A] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[24px] p-10 text-center" style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
          <History size={32} className="mx-auto mb-2 text-white/20" />
          <p className="text-white/40 text-sm">Немає транзакцій</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <p className="text-[11px] text-white/30 uppercase tracking-wider mb-2 px-1">{date}</p>
              <div className="rounded-[20px] overflow-hidden divide-y divide-white/[.04]"
                   style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
                {txs.map(tx => (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-xl shrink-0">{XP_SOURCE_ICON[tx.source]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/90 truncate">{tx.description}</p>
                      <p className="text-[11px] text-white/35 mt-0.5">
                        {XP_SOURCE_LABEL[tx.source]} · {tx.createdAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`text-sm font-bold tabular-nums shrink-0 ${tx.amount > 0 ? 'text-[#4CAF50]' : 'text-[#FF5252]'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
