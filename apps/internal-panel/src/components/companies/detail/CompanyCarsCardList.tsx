import type { Car, CarTelemetryMarker } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  CarCard,
  carDetailsLinkClassName,
  type CarCardLabels,
} from '@fuel-carrier/web-ui/dashboard'
import { Info } from '@fuel-carrier/web-ui/icons'
import { ICON_STROKE_WIDTH } from '@fuel-carrier/web-ui/ui'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { ResourceOperations } from './resourceListViews'

const CAR_GRID_CLASS_NAME =
  'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'

type CompanyCarsCardListProps = {
  companyId: string
  cars: Car[]
  telemetryByCarId: ReadonlyMap<string, CarTelemetryMarker>
  onEdit: (car: Car) => void
  onDelete: (car: Car) => void
  onMqttCredentials: (car: Car) => void
  renderExtraActions: (car: Car) => ReactNode
}

export function CompanyCarsCardList({
  companyId,
  cars,
  telemetryByCarId,
  onEdit,
  onDelete,
  onMqttCredentials,
  renderExtraActions,
}: CompanyCarsCardListProps) {
  const { LL } = useI18nContext()
  const detail = LL.internalPanel.companies.detail
  const labels = carCardLabels(LL)

  return (
    <ul className={CAR_GRID_CLASS_NAME}>
      {cars.map(function renderCarCard(car) {
        return (
          <li key={car.id}>
            <CarCard
              car={car}
              telemetry={telemetryByCarId.get(car.id) ?? null}
              labels={labels}
              detailsLink={
                <Link
                  to="/companies/$companyId/cars/$carId"
                  params={{ companyId, carId: car.id }}
                  className={carDetailsLinkClassName}
                >
                  <Info
                    className="size-3.5"
                    strokeWidth={ICON_STROKE_WIDTH}
                    aria-hidden
                  />
                  {detail.viewCar()}
                </Link>
              }
              actions={
                <ResourceOperations
                  item={car}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onMqttCredentials={onMqttCredentials}
                  renderExtraActions={renderExtraActions}
                  className="max-w-full justify-end"
                />
              }
            />
          </li>
        )
      })}
    </ul>
  )
}

function carCardLabels(
  LL: ReturnType<typeof useI18nContext>['LL'],
): CarCardLabels {
  const detail = LL.internalPanel.companies.detail

  return {
    locationLive: LL.internalPanel.home.vehicleLive,
    statusOffline: LL.internalPanel.home.vehicleOffline,
    noDriver: detail.noDriver,
    mobileUnknown: LL.internalPanel.home.mobileUnknown,
    remainFuelUnknown: detail.remainFuelUnknown,
    tankUnit: detail.tankUnit,
    fuelVolumeOfCapacity: LL.internalPanel.home.fuelVolumeOfCapacity,
    fuelType: detail,
  }
}
