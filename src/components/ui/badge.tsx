import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'gold' | 'red'
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-white/[.08] text-white/60',
    success: 'bg-[#19C45A]/15 text-[#19C45A]',
    error:   'bg-[#FF3D00]/15 text-[#FF3D00]',
    warning: 'bg-[#FF9800]/15 text-[#FF9800]',
    gold:    'bg-[#FFCC00]/15 text-[#FFCC00]',
    red:     'bg-[#D50000]/15 text-[#FF3D00]',
  }
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', variants[variant], className)}
      {...props}
    />
  )
}
