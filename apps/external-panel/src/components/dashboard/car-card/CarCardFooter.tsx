import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Info } from '@fuel-carrier/web-ui/icons'
import { ICON_STROKE_WIDTH } from '@fuel-carrier/web-ui/ui'
import { Link } from '@tanstack/react-router'

type CarCardFooterProps = {
  carId: string
}

export function CarCardFooter({ carId }: CarCardFooterProps) {
  const { LL } = useI18nContext()

  return (
    <div className="relative z-10 mt-auto flex items-end justify-between gap-3 px-4 pb-4 pt-3">
      <div className="relative h-16 w-28 shrink-0">
        <img
          src="/truck-card.png"
          alt=""
          className="h-full w-full object-contain object-bottom"
          draggable={false}
        />
      </div>
      <Link
        to="/cars/$carId"
        params={{ carId }}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-content transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <Info
          className="size-3.5"
          strokeWidth={ICON_STROKE_WIDTH}
          aria-hidden
        />
        {LL.externalPanel.auditLogs.details()}
      </Link>
    </div>
  )
}
