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

  /* ─── Shared form markup ─── */
  const formFields = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email або телефон"
        required
        autoComplete="email"
        className="w-full h-12 px-4 rounded-[14px] bg-[#1A120F] border border-[#34201A] text-[#F5F5F5] placeholder-[#9A9692] text-sm focus:outline-none focus:border-[#E30613]/50 focus:bg-[#1f1612] transition-all"
      />

      {!resetMode && (
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Пароль"
          required
          autoComplete="current-password"
          className="w-full h-12 px-4 rounded-[14px] bg-[#1A120F] border border-[#34201A] text-[#F5F5F5] placeholder-[#9A9692] text-sm focus:outline-none focus:border-[#E30613]/50 focus:bg-[#1f1612] transition-all"
        />
      )}

      <button
        type="submit"
        disabled={loading}
        className="tr-btn-brand w-full h-14 mt-2 text-base font-bold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && (
          <svg className="animate-spin size-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {resetMode ? 'Відправити лист' : 'Увійти'}
      </button>

      {!resetMode && (
        <button
          type="button"
          disabled
          className="w-full h-12 rounded-[16px] border border-[#34201A] text-[#F5F5F5] text-sm font-semibold hover:bg-[#1A120F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Зареєструватись
        </button>
      )}

      <button
        type="button"
        onClick={() => setResetMode(v => !v)}
        className="w-full mt-1 text-xs text-[#9A9692] hover:text-[#F5F5F5] transition-colors text-center"
      >
        {resetMode ? '← Повернутись до входу' : 'Забули пароль?'}
      </button>
    </form>
  )

  const guestLink = (
    <p className="mt-6 text-[11px] text-[#9A9692] text-center">
      Без акаунту?{' '}
      <button
        onClick={() => router.push('/dashboard')}
        className="text-[#FF6A00] hover:text-[#FFC400] transition-colors font-medium"
      >
        Гість
      </button>
    </p>
  )

  return (
    <>
      {/* ══════════════════════════════════════════════
          MOBILE  (<lg) — centered single column
      ══════════════════════════════════════════════ */}
      <div
        className="lg:hidden relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-12"
        style={{ background: '#080808' }}
      >
        {/* Energy lines */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-30 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/overlays/energy-lines.svg" alt="" className="w-full" />
        </div>
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(227,6,19,.12) 0%, transparent 60%)' }}
        />

        <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
          {/* Logo + fire ring */}
          <div className="relative mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/overlays/fire-ring.svg"
              alt=""
              className="absolute -inset-6 opacity-60 pointer-events-none"
              aria-hidden="true"
            />
            <Image
              src="/brand/triumph-logo.png"
              alt="ТРІУМФ"
              width={80}
              height={80}
              className="rounded-2xl relative z-10"
              priority
            />
          </div>
          <h1 className="font-display text-3xl font-black text-white tracking-tight mb-1">ТРІУМФ</h1>
          <p className="text-xs text-[#9A9692] uppercase tracking-widest mb-8">Дзюдо · Самбо · Київ</p>

          <div className="tr-card w-full p-7">
            <h2 className="font-display text-lg font-bold text-[#F5F5F5] mb-6 text-center">
              {resetMode ? 'Відновлення паролю' : 'Вхід до акаунту'}
            </h2>
            {formFields}
          </div>
          {guestLink}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          DESKTOP (lg+) — split: hero left / form right
      ══════════════════════════════════════════════ */}
      <div className="hidden lg:flex min-h-screen" style={{ background: '#050505' }}>

        {/* Left hero column — 55% */}
        <div className="relative w-[55%] flex flex-col justify-between p-14 overflow-hidden">

          {/* Background: judo fighters photo */}
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/hero/hero-judo-fire.webp"
              alt=""
              className="w-full h-full object-cover object-center"
            />
            {/* Dark-left gradient: keeps text readable, reveals fighters on right side */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(5,5,5,.93) 0%, rgba(5,5,5,.80) 40%, rgba(5,5,5,.42) 65%, rgba(5,5,5,.70) 100%)',
              }}
            />
          </div>

          {/* Energy lines */}
          <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none opacity-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/overlays/energy-lines.svg" alt="" className="w-full" />
          </div>
          {/* Sparks */}
          <div className="absolute inset-0 z-10 pointer-events-none opacity-25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/overlays/sparks-overlay.webp"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          {/* Top bar: logo + name */}
          <div className="relative z-20 flex items-center gap-3">
            <Image
              src="/brand/triumph-logo.png"
              alt="ТРІУМФ"
              width={52}
              height={52}
              className="rounded-xl"
            />
            <span className="font-display text-xl font-black text-white tracking-tight">ТРІУМФ</span>
          </div>

          {/* Center: big headline */}
          <div className="relative z-20">
            <h1 className="font-display font-black text-white leading-none" style={{ fontSize: '72px' }}>
              ТРІУМФ
            </h1>
            <p className="text-lg text-[#F5F5F5]/80 mt-3 font-medium">
              Дзюдо та самбо для дітей і дорослих
            </p>
            <p className="text-sm text-[#9A9692] mt-1">
              Київ · Тренування, нагороди, пояси — все в одному місці
            </p>
          </div>

          {/* Bottom: stats row */}
          <div className="relative z-20 flex items-center gap-8">
            {[
              { value: '247', label: 'спортсменів' },
              { value: '18', label: 'тренерів' },
              { value: '1540', label: 'рейтинг' },
              { value: '137', label: 'досягнень' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="font-display text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-[#9A9692] mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right form column — 45% */}
        <div
          className="flex-1 flex items-center justify-center px-16 py-12 relative"
          style={{ background: 'rgba(8,8,8,.97)', borderLeft: '1px solid rgba(52,32,26,.5)' }}
        >
          {/* Corner glow */}
          <div
            className="absolute top-0 left-0 w-80 h-80 pointer-events-none"
            style={{ background: 'radial-gradient(circle at top left, rgba(227,6,19,.07) 0%, transparent 60%)' }}
          />

          <div className="w-full max-w-sm relative z-10">
            {/* Logo + heading */}
            <Image
              src="/brand/triumph-logo.png"
              alt="ТРІУМФ"
              width={52}
              height={52}
              className="rounded-xl mb-5"
            />
            <h2 className="font-display text-2xl font-black text-[#F5F5F5] mb-1">
              {resetMode ? 'Відновлення' : 'Вхід до акаунту'}
            </h2>
            <p className="text-sm text-[#9A9692] mb-8">Клуб дзюдо ТРІУМФ · Київ</p>

            {formFields}
            {guestLink}
          </div>
        </div>
      </div>
    </>
  )
}
