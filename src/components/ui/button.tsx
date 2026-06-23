import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  className,
  children,
  ...props
}, ref) => {
  const base = 'inline-flex items-center justify-center gap-2 font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none select-none'

  const variants = {
    primary:   'tr-btn-brand text-black rounded-[14px]',
    secondary: 'bg-white/[.06] border border-white/10 text-white hover:bg-white/10 rounded-[14px]',
    ghost:     'text-white/50 hover:text-white hover:bg-white/[.06] rounded-[14px]',
    danger:    'bg-[#FF3D00] text-white hover:bg-[#cc3200] rounded-[14px] shadow-glow',
    outline:   'border border-[#FF9800] text-[#FF9800] hover:bg-[#FF9800]/10 rounded-[14px]',
  }
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-5 text-sm',
    lg: 'h-12 px-7 text-base',
  }
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
})
Button.displayName = 'Button'

export { Button }
