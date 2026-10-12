import type { HTMLAttributes } from 'react'
import { cn } from '../utils'

type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string | null
  alt?: string
  /** Initials or short label shown when there is no image. */
  fallback: string
  size?: AvatarSize
}

export type { AvatarSize }

export const avatarSizeClassName: Record<AvatarSize, string> = {
  sm: 'size-9 text-xs font-semibold',
  md: 'size-12 text-md font-medium',
  lg: 'size-16 text-lg font-medium',
}

export function Avatar({
  src,
  alt = '',
  fallback,
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-base-content/10 bg-base-100/60 text-base-content/40',
        avatarSizeClassName[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        fallback
      )}
    </span>
  )
}
