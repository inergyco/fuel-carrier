import type { ReactNode } from 'react'
import { cn } from '../utils'

export type PageHeaderProps = {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  /** Heading level. Page roots use `h1`; nested page sections use `h2`. */
  as?: 'h1' | 'h2'
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  actions,
  as: TitleTag = 'h1',
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        actions &&
          'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {title ? (
          <TitleTag className="truncate text-lg font-semibold tracking-tight">
            {title}
          </TitleTag>
        ) : null}
        {subtitle ? (
          <div
            className={cn(
              'truncate text-sm text-base-content/50',
              title && 'mt-1',
            )}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
      {actions ? <div className="w-full shrink-0 sm:w-auto">{actions}</div> : null}
    </div>
  )
}
