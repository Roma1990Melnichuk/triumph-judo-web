'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useChildren } from '@/lib/hooks/useChildren'
import { useGroups } from '@/lib/hooks/useGroups'
import { auth } from '@/lib/firebase'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Building2,
  Bell,
  Globe,
  CreditCard,
  Users,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Key,
  Shield,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SettingRowProps {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  label: string
  sublabel?: string
  onClick?: () => void
  danger?: boolean
}

function SettingRow({ icon: Icon, iconBg, iconColor, label, sublabel, onClick, danger }: SettingRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1A120F] transition-colors text-left ${danger ? 'rounded-[24px]' : ''}`}
    >
      <div
        className="size-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={16} color={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${danger ? 'text-[#FF3B30]' : 'text-[#F5F5F5]'}`}>{label}</p>
        {sublabel && <p className="text-xs text-[#9A9692] mt-0.5">{sublabel}</p>}
      </div>
      <ChevronRight size={16} className="text-[#9A9692] shrink-0" />
    </button>
  )
}

export default function SettingsPage() {
  const { userModel, signOut } = useAuth()
  const isCoach = userModel?.role === 'coach'

  // All hooks unconditionally
  const { children } = useChildren(isCoach ? userModel?.uid : undefined)
  const { groups } = useGroups(isCoach ? userModel?.uid : undefined)

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
    <div className="space-y-5 max-w-lg">

      {/* Profile hero */}
      <div className="tr-card p-6 flex flex-col items-center text-center">
        <Avatar
          name={userModel?.name ?? ''}
          photoUrl={userModel?.photoUrl}
          size="xl"
          className="mb-3 !size-20 !text-2xl"
        />
        <p className="font-bold text-lg text-[#F5F5F5]">{userModel?.name ?? '—'}</p>
        <span
          className="mt-1 px-3 py-0.5 rounded-full text-xs font-semibold"
          style={{
            background: isCoach ? 'rgba(227,6,19,.18)' : 'rgba(255,106,0,.15)',
            color: isCoach ? '#E30613' : '#FF6A00',
          }}
        >
          {isCoach ? 'Тренер' : 'Батько/Мати'}
        </span>

        {/* Coach stats row */}
        {isCoach && (
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#34201A] w-full justify-center">
            <div className="text-center">
              <p className="text-xl font-display font-black text-[#F5F5F5]">{children.length}</p>
              <p className="text-[11px] text-[#9A9692]">спортсменів</p>
            </div>
            <div className="w-px h-8 bg-[#34201A]" />
            <div className="text-center">
              <p className="text-xl font-display font-black text-[#F5F5F5]">{groups.length}</p>
              <p className="text-[11px] text-[#9A9692]">груп</p>
            </div>
          </div>
        )}
      </div>

      {/* General section */}
      <div className="tr-card overflow-hidden">
        <p className="px-4 pt-4 pb-2 text-[11px] font-bold text-[#9A9692] uppercase tracking-wider">Загальне</p>
        <div className="divide-y divide-[#34201A]">
          <SettingRow
            icon={Building2}
            iconBg="rgba(227,6,19,.15)"
            iconColor="#E30613"
            label="Інформація про клуб"
            sublabel="ТРІУМФ · Дзюдо · Київ"
          />
          <SettingRow
            icon={Bell}
            iconBg="rgba(255,106,0,.15)"
            iconColor="#FF6A00"
            label="Сповіщення"
            sublabel="Керування повідомленнями"
          />
          <SettingRow
            icon={Globe}
            iconBg="rgba(41,209,88,.12)"
            iconColor="#29D158"
            label="Мова"
            sublabel="🇺🇦 Українська"
          />
        </div>
      </div>

      {/* Coach-only: Tariffs & Memberships */}
      {isCoach && (
        <div className="tr-card overflow-hidden">
          <p className="px-4 pt-4 pb-2 text-[11px] font-bold text-[#9A9692] uppercase tracking-wider">Фінанси</p>
          <div className="divide-y divide-[#34201A]">
            <SettingRow
              icon={CreditCard}
              iconBg="rgba(255,196,0,.12)"
              iconColor="#FFC400"
              label="Тарифи"
              sublabel="Налаштування абонементів"
            />
            <SettingRow
              icon={Users}
              iconBg="rgba(255,196,0,.08)"
              iconColor="#FFD23F"
              label="Абонементи"
              sublabel="Стан оплат спортсменів"
            />
          </div>
        </div>
      )}

      {/* Change password (collapsible) */}
      <div className="tr-card overflow-hidden">
        <p className="px-4 pt-4 pb-2 text-[11px] font-bold text-[#9A9692] uppercase tracking-wider">Безпека</p>
        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1A120F] transition-colors"
          onClick={() => setChangingPw(p => !p)}
        >
          <div className="size-9 rounded-xl flex items-center justify-center shrink-0 bg-[rgba(227,6,19,.15)]">
            <Key size={16} color="#E30613" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-[#F5F5F5]">Змінити пароль</p>
            <p className="text-xs text-[#9A9692]">Оновлення пароля облікового запису</p>
          </div>
          <ChevronRight
            size={16}
            className={`text-[#9A9692] shrink-0 transition-transform ${changingPw ? 'rotate-90' : ''}`}
          />
        </button>

        {changingPw && (
          <form onSubmit={handleChangePw} className="px-4 pb-4 space-y-3 border-t border-[#34201A] pt-4">
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
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setChangingPw(false)
                  setPwForm({ current: '', next: '', confirm: '' })
                }}
              >
                Скасувати
              </Button>
              <Button type="submit" loading={savingPw}>Змінити</Button>
            </div>
          </form>
        )}

        <div className="border-t border-[#34201A]">
          <SettingRow
            icon={Shield}
            iconBg="rgba(155,155,155,.10)"
            iconColor="#9A9692"
            label="Двофакторна автентифікація"
            sublabel="Недоступна в поточній версії"
          />
        </div>
      </div>

      {/* Support */}
      <div className="tr-card overflow-hidden">
        <p className="px-4 pt-4 pb-2 text-[11px] font-bold text-[#9A9692] uppercase tracking-wider">Підтримка</p>
        <div className="divide-y divide-[#34201A]">
          <SettingRow
            icon={HelpCircle}
            iconBg="rgba(41,182,246,.12)"
            iconColor="#29B6F6"
            label="Допомога"
            sublabel="FAQ та підтримка"
          />
          <SettingRow
            icon={Info}
            iconBg="rgba(155,155,155,.10)"
            iconColor="#9A9692"
            label="Про додаток"
            sublabel="Версія 1.0.0 · ТРІУМФ"
          />
        </div>
      </div>

      {/* Danger: Sign out */}
      <div
        className="tr-card overflow-hidden border"
        style={{ borderColor: 'rgba(255,59,48,.25)' }}
      >
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-[#FF3B30]/10 transition-colors"
        >
          <div className="size-9 rounded-xl flex items-center justify-center shrink-0 bg-[rgba(255,59,48,.15)]">
            <LogOut size={16} color="#FF3B30" />
          </div>
          <p className="text-sm font-semibold text-[#FF3B30]">Вийти</p>
        </button>
      </div>

      <p className="text-center text-xs text-[#34201A] pb-4">ТРІУМФ · Версія 1.0.0</p>
    </div>
  )
}
