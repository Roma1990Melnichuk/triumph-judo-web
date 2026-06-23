import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  tatami?: boolean
}

export function Card({ className, glow, tatami, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'tr-card overflow-hidden',
        tatami && 'tr-tatami',
        glow && 'shadow-[0_0_28px_rgba(255,61,0,.12)]',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pt-5 pb-3', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pb-5', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-display font-bold text-white', className)} {...props} />
}
