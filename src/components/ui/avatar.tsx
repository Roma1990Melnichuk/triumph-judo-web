import Image from 'next/image'
import { cn, avatarColor } from '@/lib/utils'

interface AvatarProps {
  name: string
  photoUrl?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-12 text-base', xl: 'size-16 text-xl' }

export function Avatar({ name, photoUrl, size = 'md', className }: AvatarProps) {
  const initials = name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
  const bg = avatarColor(name)
  return (
    <div
      className={cn('rounded-full overflow-hidden flex items-center justify-center font-bold text-white flex-shrink-0', sizes[size], className)}
      style={photoUrl ? undefined : { backgroundColor: bg }}
    >
      {photoUrl
        ? <Image src={photoUrl} alt={name} fill className="object-cover" sizes="64px" />
        : initials
      }
    </div>
  )
}
