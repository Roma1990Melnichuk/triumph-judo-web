'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
      toast.error(resetMode ? 'Помилка. Перевірте email.' : 'Невірний email або пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="size-16 rounded-2xl bg-cta-gradient flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-black text-black">Т</span>
          </div>
          <h1 className="text-2xl font-black text-[#F7F5F2]">ТРІУМФ</h1>
          <p className="text-sm text-[#746E68] mt-1">Judo Club Management</p>
        </div>

        {/* Form */}
        <div className="bg-[#120605] border border-[#2A1410] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-[#F7F5F2] mb-5">
            {resetMode ? 'Відновлення паролю' : 'Вхід'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="coach@triumph.ua"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            {!resetMode && (
              <Input
                label="Пароль"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            )}
            <Button type="submit" loading={loading} className="w-full mt-2">
              {resetMode ? 'Відправити лист' : 'Увійти'}
            </Button>
          </form>
          <button
            onClick={() => setResetMode(!resetMode)}
            className="w-full mt-4 text-sm text-[#746E68] hover:text-[#B7B0A8] transition-colors text-center"
          >
            {resetMode ? '← Повернутись до входу' : 'Забули пароль?'}
          </button>
        </div>
      </div>
    </div>
  )
}
