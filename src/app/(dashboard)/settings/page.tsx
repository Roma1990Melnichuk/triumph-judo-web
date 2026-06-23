'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { auth } from '@/lib/firebase'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Moon, Globe, LogOut, Shield, Building2, User, Key, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { userModel, signOut } = useAuth()
  const [changingPw, setChangingPw] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('До побачення!')
    } catch {
      toast.error('Помилка виходу')
    }
  }

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.next !== pwForm.confirm) {
      toast.error('Паролі не співпадають')
      return
    }
    if (pwForm.next.length < 6) {
      toast.error('Пароль має бути не менше 6 символів')
      return
    }
    const user = auth.currentUser
    if (!user || !user.email) return
    setSavingPw(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, pwForm.current)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, pwForm.next)
      toast.success('Пароль змінено')
      setChangingPw(false)
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'auth/wrong-password') toast.error('Невірний поточний пароль')
      else toast.error('Помилка зміни пароля')
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-lg font-bold text-[#F7F5F2]">Налаштування</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm"><User size={15} /> Профіль</CardTitle>
        </CardHeader>
        <CardContent className="pb-5">
          <div className="flex items-center gap-4 mb-4">
            <Avatar name={userModel?.name ?? ''} photoUrl={userModel?.photoUrl} size="lg" />
            <div>
              <p className="font-bold text-[#F7F5F2]">{userModel?.name}</p>
              <Badge variant={userModel?.role === 'coach' ? 'red' : 'default'} className="mt-1">
                {userModel?.role === 'coach' ? 'Тренер' : 'Батьки'}
              </Badge>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[#2A1410]">
              <span className="text-sm text-[#B7B0A8]">Email</span>
              <span className="text-sm text-[#F7F5F2]">{userModel?.email ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#2A1410]">
              <span className="text-sm text-[#B7B0A8]">Телефон</span>
              <span className="text-sm text-[#F7F5F2]">{userModel?.phone ?? 'Не вказано'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardContent className="p-5">
          <button
            className="w-full flex items-center gap-3"
            onClick={() => setChangingPw(p => !p)}
          >
            <div className="size-9 rounded-xl bg-[#D50000]/10 flex items-center justify-center">
              <Key size={15} className="text-[#D50000]" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-[#F7F5F2]">Змінити пароль</p>
              <p className="text-xs text-[#746E68]">Оновлення пароля облікового запису</p>
            </div>
            <ChevronRight size={16} className={`text-[#746E68] transition-transform ${changingPw ? 'rotate-90' : ''}`} />
          </button>

          {changingPw && (
            <form onSubmit={handleChangePw} className="mt-4 space-y-3">
              <Input
                label="Поточний пароль"
                type="password"
                value={pwForm.current}
                onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                required
                placeholder="••••••••"
              />
              <Input
                label="Новий пароль"
                type="password"
                value={pwForm.next}
                onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                required
                placeholder="••••••••"
              />
              <Input
                label="Підтвердіть новий пароль"
                type="password"
                value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                required
                placeholder="••••••••"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" type="button" onClick={() => { setChangingPw(false); setPwForm({ current: '', next: '', confirm: '' }) }}>Скасувати</Button>
                <Button type="submit" loading={savingPw}>Змінити</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Theme info */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#1B0A08] flex items-center justify-center">
              <Moon size={15} className="text-[#B7B0A8]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#F7F5F2]">Темна тема</p>
              <p className="text-xs text-[#746E68]">Додаток завжди використовує темну тему</p>
            </div>
            <Badge variant="default">Завжди</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Language info */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#1B0A08] flex items-center justify-center">
              <Globe size={15} className="text-[#B7B0A8]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#F7F5F2]">Мова</p>
              <p className="text-xs text-[#746E68]">Інтерфейс відображається українською мовою</p>
            </div>
            <Badge variant="default">🇺🇦 Українська</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Coach: Club info placeholder */}
      {userModel?.role === 'coach' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm"><Building2 size={15} /> Інформація про клуб</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-[#2A1410]">
                <span className="text-sm text-[#B7B0A8]">Назва клубу</span>
                <span className="text-sm text-[#F7F5F2]">Тріумф</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#2A1410]">
                <span className="text-sm text-[#B7B0A8]">Вид спорту</span>
                <span className="text-sm text-[#F7F5F2]">Дзюдо</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#B7B0A8]">ID тренера</span>
                <span className="text-xs text-[#746E68] font-mono">{userModel.uid.slice(0, 8)}...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#1B0A08] flex items-center justify-center">
              <Shield size={15} className="text-[#B7B0A8]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#F7F5F2]">Безпека</p>
              <p className="text-xs text-[#746E68]">Двофакторна автентифікація недоступна</p>
            </div>
            <Badge variant="default">Базова</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sign out */}
      <Button variant="danger" className="w-full" onClick={handleSignOut}>
        <LogOut size={16} className="mr-2" />
        Вийти з акаунту
      </Button>

      <p className="text-center text-xs text-[#2A1410]">Тріумф · Версія 1.0.0</p>
    </div>
  )
}
