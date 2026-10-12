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
import { ResourceOperations } from '../users/ResourceOperations'
import type { ResourceActionLabels } from '../users/ResourceSection'

const CAR_GRID_CLASS_NAME =
  'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'

type CarsCardListProps = {
  cars: Car[]
  telemetryByCarId: ReadonlyMap<string, CarTelemetryMarker>
  actionLabels: ResourceActionLabels
  onEdit: (car: Car) => void
  onDelete: (car: Car) => void
  onMqttCredentials?: (car: Car) => void
  renderExtraActions?: (car: Car) => ReactNode
  readOnly?: boolean
}

export function CarsCardList({
  cars,
  telemetryByCarId,
  actionLabels,
  onEdit,
  onDelete,
  onMqttCredentials,
  renderExtraActions,
  readOnly = false,
}: CarsCardListProps) {
  const { LL } = useI18nContext()
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
                  to="/cars/$carId"
                  params={{ carId: car.id }}
                  className={carDetailsLinkClassName}
                >
                  <Info
                    className="size-3.5"
                    strokeWidth={ICON_STROKE_WIDTH}
                    aria-hidden
                  />
                  {LL.externalPanel.auditLogs.details()}
                </Link>
              }
              actions={
                <ResourceOperations
                  item={car}
                  actionLabels={actionLabels}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onMqttCredentials={onMqttCredentials}
                  renderExtraActions={renderExtraActions}
                  readOnly={readOnly}
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
  return {
    locationLive: LL.externalPanel.home.locationLive,
    statusOffline: LL.externalPanel.home.statusOffline,
    noDriver: LL.externalPanel.cars.noDriver,
    mobileUnknown: LL.externalPanel.home.mobileUnknown,
    remainFuelUnknown: LL.externalPanel.cars.remainFuelUnknown,
    tankUnit: LL.externalPanel.cars.tankUnit,
    fuelVolumeOfCapacity: LL.externalPanel.home.fuelVolumeOfCapacity,
    fuelType: LL.externalPanel.cars,
  }
}
