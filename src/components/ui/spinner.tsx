import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('size-8 border-2 border-[#2A1410] border-t-[#FFD21A] rounded-full animate-spin', className)} />
  )
}

export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#030303]">
      <Spinner className="size-10" />
    </div>
  )
}
