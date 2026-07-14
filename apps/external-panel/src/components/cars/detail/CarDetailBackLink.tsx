import { Link } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { ICON_STROKE_WIDTH, iconMdClassName } from '@fuel-carrier/web-ui/ui'
import { ArrowLeft } from '@fuel-carrier/web-ui/icons'
import { cn } from '@fuel-carrier/web-ui/utils'

export function CarDetailBackLink() {
  const { LL } = useI18nContext()

  return (
    <Link
      to="/cars"
      className="mb-4 inline-flex items-center gap-2 text-sm text-base-content/65 transition-colors hover:text-base-content"
    >
      <ArrowLeft
        className={cn(iconMdClassName, 'rtl:rotate-180')}
        strokeWidth={ICON_STROKE_WIDTH}
        aria-hidden
      />
      {LL.externalPanel.cars.backToList()}
    </Link>
  )
}
