import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function dateKey(date: Date): string {
  const d = date
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function avatarColor(seed: string): string {
  const colors = ['#D32F2F','#7B1FA2','#1565C0','#2E7D32','#EF6C00','#00838F']
  const code = seed.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  return colors[code % colors.length]
}

export function getAge(birthYear: number): number {
  return new Date().getFullYear() - birthYear
}

export function getAgeCategory(birthYear: number): string {
  const age = getAge(birthYear)
  if (age <= 8)  return 'Малюки'
  if (age <= 10) return 'Міні'
  if (age <= 12) return 'Юніори мол.'
  if (age <= 14) return 'Кадети'
  if (age <= 17) return 'Юніори'
  if (age <= 20) return 'Молодь'
  return 'Дорослі'
}

export function displayWeight(w: string): string {
  return w.startsWith('-') ? w.substring(1) : w
}
