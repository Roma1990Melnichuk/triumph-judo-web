import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, className, children, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm text-[#B7B0A8] mb-1.5">{label}</label>}
    <select
      ref={ref}
      className={cn(
        'w-full h-10 px-3 bg-[#1B0A08] border border-[#2A1410] rounded-xl text-[#F7F5F2] text-sm',
        'focus:outline-none focus:border-[#FFD21A] transition-colors appearance-none cursor-pointer',
        error && 'border-[#FF3B30]',
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-[#FF3B30]">{error}</p>}
  </div>
))
Select.displayName = 'Select'

export { Select }
