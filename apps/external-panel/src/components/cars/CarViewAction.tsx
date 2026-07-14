import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Link } from '@tanstack/react-router'
import {
  dataTableViewActionClassName,
  ICON_STROKE_WIDTH,
  iconSmClassName,
} from '@fuel-carrier/web-ui/ui'
import { Eye } from '@fuel-carrier/web-ui/icons'

interface CarViewActionProps {
  car: Car
}

export function CarViewAction({ car }: CarViewActionProps) {
  const { LL } = useI18nContext()

  return (
    <Link
      to="/cars/$carId"
      params={{ carId: car.id }}
      className={dataTableViewActionClassName()}
      aria-label={LL.externalPanel.cars.view()}
    >
      <Eye className={iconSmClassName} strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
    </Link>
  )
}
