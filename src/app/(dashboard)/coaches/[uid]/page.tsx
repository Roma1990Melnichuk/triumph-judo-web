'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { use } from 'react'
import {
  MessageSquare, Calendar, ChevronRight, ChevronDown, Award,
  Clock, Users, Star, Trophy, Medal, Shield,
} from 'lucide-react'
import { useCoachProfile, useCoachUserDoc } from '@/lib/hooks/useCoachProfile'
import { useGroups } from '@/lib/hooks/useGroups'
import { useChildren } from '@/lib/hooks/useChildren'
import { DAY_NAMES } from '@/lib/constants'
import { Avatar } from '@/components/ui/avatar'

// ── helpers ──────────────────────────────────────────────────────────────────

function danLabel(n: number) {
  if (n === 1) return '1 дан'
  if (n === 2) return '2 дан'
  if (n === 3) return '3 дан'
  return `${n} дан`
}

function daysDisplay(days: number[]) {
  return days.map(d => DAY_NAMES[(d - 1 + 7) % 7]).join(' ')
}

// ── sub-components ────────────────────────────────────────────────────────────

function HeroCard({ name, photoUrl, slogan, experienceYears, danLevel, athleteCount, coachId }: {
  name: string; photoUrl?: string; slogan: string
  experienceYears: number; danLevel: number; athleteCount: number; coachId: string
}) {
  return (
    <div className="rounded-[24px] overflow-hidden flex flex-col"
         style={{ background: 'linear-gradient(180deg, #1A0A06 0%, #0D0804 100%)', border: '1px solid #2A1810' }}>
      {/* Photo area */}
      <div className="relative flex flex-col items-center pt-8 pb-6 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-32 opacity-25"
               style={{ background: 'radial-gradient(ellipse at bottom center, #E30613 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#FF6A00]"
                style={{ background: '#FF6A0018', border: '1px solid #FF6A0035' }}>
            Тренер клубу
          </span>

          {photoUrl ? (
            <div className="relative w-28 h-28 rounded-full overflow-hidden ring-2 ring-[#E30613]/40">
              <Image src={photoUrl} alt={name} fill className="object-cover" />
            </div>
          ) : (
            <Avatar name={name} size="xl" />
          )}

          <div className="text-center">
            <h1 className="text-2xl font-display font-black text-white">{name}</h1>
            {slogan && (
              <p className="text-[12px] text-white/45 italic mt-1.5 max-w-[260px] leading-relaxed">"{slogan}"</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 border-t border-white/[.06] divide-x divide-white/[.06]">
        {[
          { value: experienceYears ? `${experienceYears}` : '—', unit: 'років', label: 'досвід' },
          { value: `${athleteCount}`, unit: 'учнів', label: 'спортсменів' },
          { value: danLabel(danLevel), unit: '', label: 'рівень' },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center py-4 gap-0.5">
            <span className="text-xl font-black text-white">{s.value}</span>
            {s.unit && <span className="text-[10px] text-[#FF6A00] font-semibold">{s.unit}</span>}
            <span className="text-[10px] text-white/30 uppercase tracking-wider">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 p-4 border-t border-white/[.06]">
        <Link href={`/messages?to=${coachId}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: '#E30613' }}>
          <MessageSquare size={15} /> Написати
        </Link>
        <Link href="/schedule"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white/80 transition-colors hover:border-[#FF6A00] hover:text-[#FF6A00]"
              style={{ border: '1px solid #3A2010' }}>
          <Calendar size={15} /> Розклад
        </Link>
      </div>
    </div>
  )
}

function InfoPanel({ name, experienceYears, danLevel, phone, email }: {
  name: string; experienceYears: number; danLevel: number; phone?: string; email: string
}) {
  const rows = [
    { label: "Ім'я", value: name },
    { label: 'Досвід', value: experienceYears ? `${experienceYears} років` : '—' },
    { label: 'Пояс', value: `Чорний ${danLabel(danLevel)}` },
    { label: 'Телефон', value: phone ?? '—' },
    { label: 'Email', value: email },
  ]
  return (
    <div className="rounded-[24px] p-5 flex flex-col gap-4"
         style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
      <h2 className="text-sm font-display font-black text-white uppercase tracking-wide">Основна інформація</h2>
      <div className="space-y-3">
        {rows.map(r => (
          <div key={r.label} className="flex items-start gap-3">
            <span className="text-[11px] text-white/35 uppercase tracking-wider w-20 shrink-0 pt-0.5">{r.label}</span>
            <span className="text-sm text-white/85 break-all">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AboutSection({ bio }: { bio: string }) {
  const [expanded, setExpanded] = useState(false)
  if (!bio) return null
  const isLong = bio.length > 200
  const displayed = isLong && !expanded ? bio.slice(0, 200) + '…' : bio

  return (
    <div className="rounded-[24px] p-5 flex flex-col gap-3"
         style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-[#FF6A00]" />
          <h2 className="text-sm font-display font-black text-white uppercase tracking-wide">Про мене</h2>
        </div>
        {isLong && (
          <button onClick={() => setExpanded(e => !e)} className="text-white/30 hover:text-white/60 transition-colors">
            <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      <p className="text-sm text-white/60 leading-relaxed">{displayed}</p>
      {isLong && !expanded && (
        <button onClick={() => setExpanded(true)} className="text-xs text-[#FF6A00] hover:text-[#FFC400] text-left">
          Показати більше
        </button>
      )}
    </div>
  )
}

function QualificationsSection({ qualifications }: { qualifications: string[] }) {
  if (!qualifications.length) return null
  return (
    <div className="rounded-[24px] p-5 flex flex-col gap-3"
         style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
      <div className="flex items-center gap-2">
        <Award size={14} className="text-[#FF6A00]" />
        <h2 className="text-sm font-display font-black text-white uppercase tracking-wide">Кваліфікація та освіта</h2>
      </div>
      <ul className="space-y-2">
        {qualifications.map((q, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <div className="mt-1 w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                 style={{ background: '#FF6A0018', border: '1px solid #FF6A0030' }}>
              <ChevronRight size={9} className="text-[#FF6A00]" />
            </div>
            <span className="text-sm text-white/70">{q}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AchievementsSection({ stats, athleteCount }: {
  stats: { studentMedals: number; nationalPrizes: number; totalStudents: number; specialTitle?: string }
  athleteCount: number
}) {
  const cards = [
    { icon: Medal, value: stats.studentMedals, label: 'медалей учнів', color: '#FFD21A' },
    { icon: Trophy, value: stats.nationalPrizes, label: 'призерів України', color: '#FF6A00' },
    { icon: Users, value: Math.max(stats.totalStudents, athleteCount), label: 'учнів підготовлено', color: '#29B6F6' },
    ...(stats.specialTitle ? [{ icon: Star, value: stats.specialTitle, label: 'нагорода', color: '#AB47BC' }] : []),
  ]
  return (
    <div className="rounded-[24px] p-5 flex flex-col gap-4"
         style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
      <div className="flex items-center gap-2">
        <Shield size={14} className="text-[#FF6A00]" />
        <h2 className="text-sm font-display font-black text-white uppercase tracking-wide">Досягнення як тренер</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c, i) => {
          const Icon = c.icon
          return (
            <div key={i} className="rounded-[16px] p-4 flex flex-col items-center gap-2 text-center"
                 style={{ background: '#1A120F', border: `1px solid ${c.color}20` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ background: `${c.color}18` }}>
                <Icon size={18} style={{ color: c.color }} />
              </div>
              <p className="text-xl font-black text-white">{c.value}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider leading-tight">{c.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GroupsSection({ coachId }: { coachId: string }) {
  const { groups, loading } = useGroups(coachId)
  return (
    <div className="rounded-[24px] p-5 flex flex-col gap-3"
         style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-[#FF6A00]" />
          <h2 className="text-sm font-display font-black text-white uppercase tracking-wide">Мої групи</h2>
        </div>
        <Link href="/schedule" className="text-[#FF6A00] text-xs font-semibold flex items-center gap-1 hover:text-[#FFC400]">
          Всі <ChevronRight size={12} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-[#1A120F] animate-pulse" />)}
        </div>
      ) : groups.length === 0 ? (
        <p className="text-sm text-white/30 py-4 text-center">Груп не знайдено</p>
      ) : (
        <div className="space-y-2">
          {groups.map(g => (
            <div key={g.id} className="flex items-center gap-3 p-3 rounded-[14px] bg-[#1A120F] border border-[#2A1810]">
              <div className="w-10 h-10 rounded-xl bg-[#E30613]/15 flex items-center justify-center shrink-0">
                <Users size={16} className="text-[#E30613]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{g.name}</p>
                <p className="text-[11px] text-white/40 flex items-center gap-2 mt-0.5">
                  <span>{daysDisplay(g.daysOfWeek)}</span>
                  <span>·</span>
                  <Clock size={10} />
                  <span>{g.timeStart}–{g.timeEnd}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PhotosSection({ photos }: { photos: string[] }) {
  if (!photos.length) return null
  return (
    <div className="rounded-[24px] p-5 flex flex-col gap-3"
         style={{ background: '#100C0A', border: '1px solid #2A1810' }}>
      <h2 className="text-sm font-display font-black text-white uppercase tracking-wide flex items-center gap-2">
        <Award size={14} className="text-[#FF6A00]" /> Фото з тренувань
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {photos.slice(0, 4).map((url, i) => (
          <div key={i} className="relative aspect-[4/3] rounded-[14px] overflow-hidden bg-[#1A120F]">
            <Image src={url} alt={`Тренування ${i + 1}`} fill className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── content (exported for testing) ───────────────────────────────────────────

export function CoachProfileContent({ uid }: { uid: string }) {
  const { user, loading: userLoading } = useCoachUserDoc(uid)
  const { profile, loading: profileLoading } = useCoachProfile(uid)
  const { children } = useChildren(uid)

  const loading = userLoading || profileLoading

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <div className="h-8 w-48 rounded-xl bg-[#1A120F] animate-pulse" />
        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4">
          <div className="h-96 rounded-[24px] bg-[#1A120F] animate-pulse" />
          <div className="h-64 rounded-[24px] bg-[#1A120F] animate-pulse" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto pt-16 text-center">
        <p className="text-white/40">Тренера не знайдено</p>
        <Link href="/dashboard" className="text-[#FF6A00] text-sm mt-2 inline-block hover:text-[#FFC400]">← Головна</Link>
      </div>
    )
  }

  const p = profile
  const athleteCount = children.length

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-white/30">
        <Link href="/dashboard" className="hover:text-white/60 transition-colors">Головна</Link>
        <ChevronRight size={12} />
        <span className="text-white/50">Тренери</span>
        <ChevronRight size={12} />
        <span className="text-white/70">{user.name}</span>
      </nav>

      {/* Top row */}
      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4">
        <HeroCard
          name={user.name}
          photoUrl={user.photoUrl}
          slogan={p?.slogan ?? ''}
          experienceYears={p?.experienceYears ?? 0}
          danLevel={p?.danLevel ?? 1}
          athleteCount={athleteCount}
          coachId={uid}
        />
        <InfoPanel
          name={user.name}
          experienceYears={p?.experienceYears ?? 0}
          danLevel={p?.danLevel ?? 1}
          phone={user.phone}
          email={user.email}
        />
      </div>

      {/* Middle: bio + qualifications */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AboutSection bio={p?.bio ?? ''} />
        <QualificationsSection qualifications={p?.qualifications ?? []} />
      </div>

      {/* Achievements */}
      {p && (
        <AchievementsSection
          stats={p.trainerStats}
          athleteCount={athleteCount}
        />
      )}

      {/* Bottom: groups + photos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GroupsSection coachId={uid} />
        {p?.trainingPhotos?.length ? <PhotosSection photos={p.trainingPhotos} /> : null}
      </div>
    </div>
  )
}

// ── page shell ────────────────────────────────────────────────────────────────

export default function CoachProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params)
  return <CoachProfileContent uid={uid} />
}
