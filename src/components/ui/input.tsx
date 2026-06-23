import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm text-[#B7B0A8] mb-1.5">{label}</label>}
    <input
      ref={ref}
      className={cn(
        'w-full h-10 px-3 bg-[#1B0A08] border border-[#2A1410] rounded-xl text-[#F7F5F2] text-sm',
        'placeholder:text-[#746E68] focus:outline-none focus:border-[#FFD21A] transition-colors',
        error && 'border-[#FF3B30]',
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-[#FF3B30]">{error}</p>}
  </div>
))
Input.displayName = 'Input'

export { Input }
