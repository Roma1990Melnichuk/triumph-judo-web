import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'gold' | 'red'
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#2A1410] text-[#B7B0A8]',
    success: 'bg-[#63D728]/15 text-[#63D728]',
    error:   'bg-[#FF3B30]/15 text-[#FF3B30]',
    warning: 'bg-[#FF8A00]/15 text-[#FF8A00]',
    gold:    'bg-[#FFD21A]/15 text-[#FFD21A]',
    red:     'bg-[#D50000]/15 text-[#D50000]',
  }
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', variants[variant], className)}
      {...props}
    />
  )
}
