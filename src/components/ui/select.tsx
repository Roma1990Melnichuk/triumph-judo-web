import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, className, children, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
    )}
    <select
      ref={ref}
      className={cn(
        'w-full h-10 px-3.5 bg-white/[.06] border border-white/10 rounded-[14px]',
        'text-white text-sm focus:outline-none focus:border-[#FF3D00]/60 focus:bg-white/[.08]',
        'transition-all appearance-none cursor-pointer',
        error && 'border-[#FF3D00]/70',
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-[#FF3D00]">{error}</p>}
  </div>
))
Select.displayName = 'Select'

export { Select }
