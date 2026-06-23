'use client'

import { ReactNode, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative z-10 w-full max-w-md tr-card shadow-2xl shadow-black/70',
        className
      )}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[.07]">
            <h2 className="text-[15px] font-display font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-0.5 rounded-lg hover:bg-white/[.06]">
              <X size={17} />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
