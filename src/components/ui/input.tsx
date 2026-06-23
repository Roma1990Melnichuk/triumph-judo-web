import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
    )}
    <input
      ref={ref}
      className={cn(
        'w-full h-10 px-3.5 bg-white/[.06] border border-white/10 rounded-[14px]',
        'text-white text-sm placeholder:text-white/25',
        'focus:outline-none focus:border-[#FF3D00]/60 focus:bg-white/[.08] transition-all',
        error && 'border-[#FF3D00]/70',
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-[#FF3D00]">{error}</p>}
  </div>
))
Input.displayName = 'Input'

export { Input }
