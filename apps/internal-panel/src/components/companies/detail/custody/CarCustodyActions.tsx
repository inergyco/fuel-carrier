import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { UserRoundPen } from '@fuel-carrier/web-ui/icons'
import { carDetailPrimaryActionClassName } from '@fuel-carrier/web-ui/cars'
import {
  Button,
  ICON_STROKE_WIDTH,
  dataTableEditActionClassName,
  iconSmClassName,
} from '@fuel-carrier/web-ui/ui'
import type { CompanyCarCustodyApi } from './useCompanyCarCustody'

type CarCustodyActionsProps = {
  car: Car
  custody: CompanyCarCustodyApi
  layout?: 'header' | 'compact'
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

  if (layout === 'compact') {
    return (
      <Button
        type="button"
        variant="ghost"
        className={dataTableEditActionClassName()}
        onClick={handleChange}
        aria-label={detail.changeDriver()}
      >
        <UserRoundPen
          className={iconSmClassName}
          strokeWidth={ICON_STROKE_WIDTH}
          aria-hidden
        />
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
        <UserRoundPen
          className={iconSmClassName}
          strokeWidth={ICON_STROKE_WIDTH}
          aria-hidden
        />
        {detail.changeDriver()}
      </span>
    </Button>
  )
}
