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
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-12"
      style={{ background: '#080808' }}>

      {/* Energy lines SVG overlay */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-30 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/overlays/energy-lines.svg" alt="" className="w-full" />
      </div>

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(227,6,19,.12) 0%, transparent 60%)' }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">

        {/* Logo + Fire ring decoration */}
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

        {/* Club name */}
        <h1 className="font-display text-3xl font-black text-white tracking-tight mb-1">
          ТРІУМФ
        </h1>
        <p className="text-xs text-[#9A9692] uppercase tracking-widest mb-8">
          Дзюдо · Самбо · Київ
        </p>

        {/* Card */}
        <div className="tr-card w-full p-7">
          <h2 className="font-display text-lg font-bold text-[#F5F5F5] mb-6 text-center">
            {resetMode ? 'Відновлення паролю' : 'Вхід до акаунту'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email або телефон"
                required
                autoComplete="email"
                className="w-full h-12 px-4 rounded-[14px] bg-[#1A120F] border border-[#34201A] text-[#F5F5F5] placeholder-[#9A9692] text-sm focus:outline-none focus:border-[#E30613]/50 focus:bg-[#1f1612] transition-all"
              />
            </div>

            {!resetMode && (
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Пароль"
                  required
                  autoComplete="current-password"
                  className="w-full h-12 px-4 rounded-[14px] bg-[#1A120F] border border-[#34201A] text-[#F5F5F5] placeholder-[#9A9692] text-sm focus:outline-none focus:border-[#E30613]/50 focus:bg-[#1f1612] transition-all"
                />
              </div>
            )}

            {/* Primary CTA */}
            <button
              type="submit"
              disabled={loading}
              className="tr-btn-brand w-full h-14 mt-2 text-base font-bold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin size-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              {resetMode ? 'Відправити лист' : 'Увійти'}
            </button>
          </form>

          {/* Register button */}
          {!resetMode && (
            <button
              type="button"
              disabled
              className="w-full h-12 mt-3 rounded-[16px] border border-[#34201A] text-[#F5F5F5] text-sm font-semibold hover:bg-[#1A120F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Зареєструватись
            </button>
          )}

          {/* Forgot password toggle */}
          <button
            onClick={() => setResetMode(v => !v)}
            className="w-full mt-4 text-xs text-[#9A9692] hover:text-[#F5F5F5] transition-colors text-center"
          >
            {resetMode ? '← Повернутись до входу' : 'Забули пароль?'}
          </button>
        </div>

        {/* Guest link */}
        <p className="mt-6 text-[11px] text-[#9A9692]">
          Без акаунту?{' '}
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#FF6A00] hover:text-[#FFC400] transition-colors font-medium"
          >
            Гість
          </button>
        </p>
      </div>
    </div>
  )
}
