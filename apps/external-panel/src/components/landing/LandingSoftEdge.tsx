import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@fuel-carrier/web-ui/utils'

type LandingSoftEdgeProps = {
  edge: 'top' | 'bottom'
  className?: string
  children: ReactNode
}

/** Subtle soft fade on one edge — same language as the card silhouette. */
export function LandingSoftEdge({
  edge,
  className,
  children,
}: LandingSoftEdgeProps) {
  const maskImage =
    edge === 'bottom'
      ? 'linear-gradient(to bottom, #000 0%, #000 78%, rgba(0,0,0,0.55) 90%, transparent 100%)'
      : 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 10%, #000 22%, #000 100%)'

  const style: CSSProperties = {
    WebkitMaskImage: maskImage,
    maskImage,
  }

  return (
    <div className={cn('relative', className)} style={style}>
      {children}
    </div>
  )
}
