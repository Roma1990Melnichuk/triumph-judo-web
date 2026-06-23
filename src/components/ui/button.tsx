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
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#030303]'
  const variants = {
    primary:   'bg-cta-gradient text-black hover:opacity-90 focus:ring-[#FFD21A]',
    secondary: 'bg-[#1B0A08] border border-[#2A1410] text-[#F7F5F2] hover:bg-[#2A1410] focus:ring-[#2A1410]',
    ghost:     'text-[#B7B0A8] hover:text-[#F7F5F2] hover:bg-[#1B0A08] focus:ring-[#2A1410]',
    danger:    'bg-[#FF3B30] text-white hover:bg-[#cc2f25] focus:ring-[#FF3B30]',
    outline:   'border border-[#FFD21A] text-[#FFD21A] hover:bg-[#FFD21A]/10 focus:ring-[#FFD21A]',
  }
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
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
