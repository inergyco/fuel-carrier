import { Shield } from '../icons'
import { cn } from '../utils'
import { useEffect, useState } from 'react'
import { ICON_STROKE_WIDTH } from './iconClassName'

interface CompanyBrandLogoProps {
  logoUrl?: string | null
  /** Accessible name when the logo is meaningful (e.g. next to company name in a table). */
  alt?: string
  className?: string
}

export function CompanyBrandLogo({
  logoUrl,
  alt = '',
  className,
}: CompanyBrandLogoProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  useEffect(
    function resetLogoStatus() {
      setStatus(logoUrl ? 'loading' : 'error')
    },
    [logoUrl],
  )

  function handleLoad() {
    setStatus('loaded')
  }

  function handleError() {
    setStatus('error')
  }

  function assignImageRef(node: HTMLImageElement | null) {
    if (node?.complete && node.naturalWidth > 0) {
      setStatus('loaded')
    }
  }

  if (!logoUrl || status === 'error') {
    return (
      <Shield
        strokeWidth={ICON_STROKE_WIDTH}
        aria-hidden={alt ? undefined : true}
        aria-label={alt || undefined}
        className={cn('size-8 shrink-0 text-base-content/40', className)}
      />
    )
  }

  return (
    <span
      className={cn(
        'relative inline-flex h-8 min-w-8 shrink-0 items-center justify-center',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 min-w-8 rounded-md border border-base-content/10 bg-base-100/80',
          status === 'loading'
            ? 'animate-pulse'
            : 'opacity-0 transition-opacity duration-200',
        )}
      />
      <img
        ref={assignImageRef}
        src={logoUrl}
        alt={alt}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'relative max-h-8 w-auto max-w-12 rounded-md object-contain transition-opacity duration-200',
          status === 'loaded' ? 'opacity-100' : 'opacity-0',
        )}
      />
    </span>
  )
}
