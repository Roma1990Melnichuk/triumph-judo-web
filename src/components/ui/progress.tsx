import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number  // 0-100
  className?: string
  barClassName?: string
  size?: 'sm' | 'md'
}

export function Progress({ value, className, barClassName, size = 'md' }: ProgressProps) {
  const h = size === 'sm' ? 'h-1.5' : 'h-2'
  return (
    <div className={cn('w-full bg-white/[.07] rounded-full overflow-hidden', h, className)}>
      <div
        className={cn('h-full bg-tr-brand rounded-full transition-all duration-500', barClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
