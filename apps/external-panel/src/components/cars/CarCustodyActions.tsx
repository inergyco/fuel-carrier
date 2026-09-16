import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { UserMinus, UserPlus, UserRoundPen } from '@fuel-carrier/web-ui/icons'
import {
  Button,
  ICON_STROKE_WIDTH,
  dataTableDeleteActionClassName,
  dataTableEditActionClassName,
  iconSmClassName,
} from '@fuel-carrier/web-ui/ui'
import type { CarCustodyApi } from './useCarCustody'

interface CarCustodyActionsProps {
  car: Car
  custody: CarCustodyApi
  layout?: 'header' | 'compact'
}

export function CarCustodyActions({
  car,
  custody,
  layout = 'header',
}: CarCustodyActionsProps) {
  const { LL } = useI18nContext()
  const hasDriver = Boolean(car.driverId)

  function handleAssign() {
    custody.openAssign(car)
  }

  function handleChange() {
    custody.openChange(car)
  }

  function handleEnd() {
    custody.openEnd(car)
  }

  if (layout === 'compact') {
    return (
      <div className="flex flex-nowrap items-center gap-2">
        {hasDriver ? (
          <>
            <Button
              type="button"
              variant="ghost"
              className={dataTableEditActionClassName()}
              onClick={handleChange}
              aria-label={LL.externalPanel.cars.changeDriver()}
            >
              <UserRoundPen
                className={iconSmClassName}
                strokeWidth={ICON_STROKE_WIDTH}
                aria-hidden
              />
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={dataTableDeleteActionClassName()}
              onClick={handleEnd}
              aria-label={LL.externalPanel.cars.endCustody()}
            >
              <UserMinus
                className={iconSmClassName}
                strokeWidth={ICON_STROKE_WIDTH}
                aria-hidden
              />
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className={dataTableEditActionClassName()}
            onClick={handleAssign}
            aria-label={LL.externalPanel.cars.assignDriver()}
          >
            <UserPlus
              className={iconSmClassName}
              strokeWidth={ICON_STROKE_WIDTH}
              aria-hidden
            />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
      {hasDriver ? (
        <>
          <Button
            type="button"
            className="h-11 w-full sm:w-auto sm:px-5"
            onClick={handleChange}
          >
            {LL.externalPanel.cars.changeDriver()}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11 w-full border border-base-content/12 bg-base-100/45 sm:w-auto sm:px-4"
            onClick={handleEnd}
          >
            {LL.externalPanel.cars.endCustody()}
          </Button>
        </>
      ) : (
        <Button
          type="button"
          className="h-11 w-full sm:w-auto sm:px-5"
          onClick={handleAssign}
        >
          {LL.externalPanel.cars.assignDriver()}
        </Button>
      )}
    </div>
  )
}
