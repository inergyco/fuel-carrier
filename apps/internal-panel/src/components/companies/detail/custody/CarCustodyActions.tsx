import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { UserRoundPen } from '@fuel-carrier/web-ui/icons'
import { carDetailPrimaryActionClassName } from '@fuel-carrier/web-ui/cars'
import {
  Button,
  ContextMenuItem,
  ICON_STROKE_WIDTH,
  dataTableEditActionClassName,
  iconSmClassName,
} from '@fuel-carrier/web-ui/ui'
import type { CompanyCarCustodyApi } from './useCompanyCarCustody'

type CarCustodyActionsProps = {
  car: Car
  custody: CompanyCarCustodyApi
  layout?: 'header' | 'compact' | 'menu'
}

/** Cars always have a driver (required at create) — only change is offered. */
export function CarCustodyActions({
  car,
  custody,
  layout = 'header',
}: CarCustodyActionsProps) {
  const { LL } = useI18nContext()
  const detail = LL.internalPanel.companies.detail

  function handleChange() {
    custody.openChange(car)
  }

  const icon = (
    <UserRoundPen
      className={iconSmClassName}
      strokeWidth={ICON_STROKE_WIDTH}
      aria-hidden
    />
  )

  if (layout === 'menu') {
    return (
      <ContextMenuItem tone="primary" icon={icon} onClick={handleChange}>
        {detail.changeDriver()}
      </ContextMenuItem>
    )
  }

  if (layout === 'compact') {
    return (
      <Button
        type="button"
        variant="ghost"
        className={dataTableEditActionClassName()}
        onClick={handleChange}
        aria-label={detail.changeDriver()}
      >
        {icon}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      className={carDetailPrimaryActionClassName}
      onClick={handleChange}
    >
      <span className="flex items-center justify-center gap-2 whitespace-nowrap">
        {icon}
        {detail.changeDriver()}
      </span>
    </Button>
  )
}
