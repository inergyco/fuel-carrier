import { Shield } from '@fuel-carrier/web-ui/icons'
import { ICON_STROKE_WIDTH } from '@fuel-carrier/web-ui/ui'
import { cn } from '@fuel-carrier/web-ui/utils'
import { useEffect, useState } from 'react'

interface CompanyBrandLogoProps {
  logoUrl?: string | null
}

export function CompanyBrandLogo({ logoUrl }: CompanyBrandLogoProps) {
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
    return <Shield strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
  }

  return (
    <span className="relative inline-flex h-8 min-w-8 items-center justify-center">
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 min-w-8 rounded-md border border-base-content/10 bg-base-100/80',
          status === 'loading' ? 'animate-pulse' : 'opacity-0 transition-opacity duration-200',
        )}
      />
      <img
        ref={assignImageRef}
        src={logoUrl}
        alt=""
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
