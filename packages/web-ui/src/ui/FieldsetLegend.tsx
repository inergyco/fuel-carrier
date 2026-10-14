import type { ReactNode } from 'react'
import { cn } from '../utils'

interface FieldsetLegendProps {
  children: ReactNode
  description?: ReactNode
  className?: string
}

export function FieldsetLegend({
  children,
  description,
  className,
}: FieldsetLegendProps) {
  return (
    <>
      <legend
        className={cn('text-sm font-medium text-base-content/80', className)}
      >
        {children}
      </legend>
      {description ? (
        <p className="text-xs text-base-content/45 leading-loose">{description}</p>
      ) : null}
    </>
  )
}
