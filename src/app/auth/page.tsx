'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const { signIn, resetPassword } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (resetMode) {
        await resetPassword(email)
        toast.success('Лист для відновлення надіслано')
        setResetMode(false)
      } else {
        await signIn(email, password)
        router.push('/dashboard')
      }
    } catch {
      toast.error(resetMode ? 'Перевірте email' : 'Невірний email або пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] flex">
      {/* ── Hero background ───────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/brand/hero/hero-judo-fire.webp"
          alt="Тріумф Дзюдо"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Left-to-right fade: text readable on left, form on right */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.92)_0%,rgba(5,5,5,0.82)_38%,rgba(5,5,5,0.50)_64%,rgba(5,5,5,0.80)_100%)]" />
      </div>

      {/* ── Energy lines overlay ───────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 z-0 pointer-events-none opacity-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/overlays/energy-lines.svg" alt="" className="w-full" />
      </div>

      {/* ── Sparks overlay ────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30 mix-blend-screen">
        <Image src="/brand/overlays/sparks-overlay.webp" alt="" fill className="object-cover" />
      </div>

      {/* ── Left column: branding ─────────────────────────────────── */}
      <div className="relative z-10 hidden lg:flex flex-col justify-between p-12 w-[55%]">
        <div className="flex items-center gap-4">
          <Image src="/brand/triumph-logo.png" alt="ТРІУМФ" width={72} height={72} className="rounded-2xl" />
        </div>

        <div>
          <h1 className="font-display text-[72px] font-black leading-[1.0] tracking-tight text-white">
            ТРІУМФ
          </h1>
          <p className="mt-4 text-[28px] font-display font-bold leading-tight uppercase text-white/90">
            Дзюдо починається<br />
            <span className="tr-gradient-text">з перемоги над собою</span>
          </p>

          {/* Stats row */}
          <div className="mt-10 flex gap-8">
            {[
              { value: '247', label: 'спортсменів\nу клубі' },
              { value: '18',  label: 'тренерів\nпрофесіоналів' },
              { value: '1540', label: 'рейтинг клубу\nсередній бал' },
              { value: '137', label: 'досягнень\n' },
            ].map(s => (
              <div key={s.value}>
                <p className="text-2xl font-display font-black text-white">{s.value}</p>
                <p className="text-[11px] text-white/55 whitespace-pre-line leading-tight mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right column: login form ──────────────────────────────── */}
      <div className="relative z-10 flex flex-col justify-center items-center w-full lg:w-[45%] px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <Image src="/brand/triumph-logo.png" alt="ТРІУМФ" width={80} height={80} className="rounded-2xl mb-3" />
          <h1 className="font-display text-4xl font-black text-white">ТРІУМФ</h1>
          <p className="text-sm text-white/60 mt-1 text-center uppercase tracking-wide">Дзюдо клуб · Система управління</p>
        </div>

        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="tr-card p-8">
            <h2 className="font-display text-xl font-bold text-white mb-6">
              {resetMode ? 'Відновлення паролю' : 'Вхід до системи'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="coach@triumph.ua"
                  required
                  autoComplete="email"
                  className="w-full h-11 px-4 rounded-[14px] bg-white/[.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#FF3D00]/60 focus:bg-white/[.08] transition-all"
                />
              </div>

              {!resetMode && (
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">Пароль</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full h-11 px-4 rounded-[14px] bg-white/[.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#FF3D00]/60 focus:bg-white/[.08] transition-all"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="tr-btn-brand w-full h-12 mt-2 text-sm font-bold rounded-[14px] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : null}
                {resetMode ? 'Відправити лист' : 'Увійти →'}
              </button>
            </form>

            <button
              onClick={() => setResetMode(v => !v)}
              className="w-full mt-4 text-xs text-white/40 hover:text-white/70 transition-colors text-center"
            >
              {resetMode ? '← Повернутись до входу' : 'Забули пароль?'}
            </button>
          </div>

          <p className="text-center text-[11px] text-white/25 mt-6">
            ТРІУМФ · Самбо Дзюдо · Спортивний клуб м. Київ
          </p>
        </div>
      </div>
    </div>
  )
}
