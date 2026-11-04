import { useState, type HTMLAttributes } from 'react'
import { cn } from '../utils'
import { ImagePreviewModal } from './ImagePreviewModal'

type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string | null
  alt?: string
  /** Initials or short label shown when there is no image. */
  fallback: string
  size?: AvatarSize
  /** When true and `src` is set, clicking opens a full-size preview. */
  preview?: boolean
  /** Optional preview dialog title; defaults to `alt`. */
  previewTitle?: string
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
  preview = false,
  previewTitle,
  className,
  ...props
}: AvatarProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const canPreview = Boolean(preview && src)

  function handleOpenPreview() {
    if (canPreview) {
      setPreviewOpen(true)
    }
  }

  function handleClosePreview() {
    setPreviewOpen(false)
  }

  const face = (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-base-content/10 bg-base-100/60 text-base-content/40',
        avatarSizeClassName[size],
        canPreview && 'transition-opacity hover:opacity-90',
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

  if (!canPreview || !src) {
    return face
  }

  return (
    <>
      <button
        type="button"
        className="inline-flex shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label={previewTitle || alt || fallback}
        onClick={handleOpenPreview}
      >
        {face}
      </button>
      <ImagePreviewModal
        open={previewOpen}
        src={src}
        alt={alt}
        title={previewTitle || alt}
        onClose={handleClosePreview}
      />
    </>
  )
}
