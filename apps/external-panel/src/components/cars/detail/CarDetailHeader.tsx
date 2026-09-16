import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { KeyRound, User } from '@fuel-carrier/web-ui/icons'
import {
  Button,
  ICON_STROKE_WIDTH,
  iconSmClassName,
} from '@fuel-carrier/web-ui/ui'
import { CarMqttCredentialsModals } from '../CarMqttCredentialsModals'
import { useCarMqttCredentials } from '../useCarMqttCredentials'
import { CarCustodyActions } from '../CarCustodyActions'
import type { CarCustodyApi } from '../useCarCustody'
import { CarDetailBackLink } from './CarDetailBackLink'

interface CarDetailHeaderProps {
  car: Car
  custody: CarCustodyApi
  canManage: boolean
}

export function CarDetailHeader({
  car,
  custody,
  canManage,
}: CarDetailHeaderProps) {
  const { LL } = useI18nContext()
  const mqtt = useCarMqttCredentials()
  const title =
    car.name?.trim() || car.licensePlate || LL.externalPanel.cars.detailTitle()
  const driverName = custody.currentDriverName(car)

  function handleOpenMqttCredentials() {
    mqtt.openMqttCredentials(car)
  }

  return (
    <div className="mb-6">
      <CarDetailBackLink />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          <p className="mt-1 font-mono text-sm text-base-content/50">
            {car.licensePlate}
          </p>
          <p className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg border border-base-content/10 bg-base-100/40 px-3 py-2 text-sm">
            <User
              className={iconSmClassName}
              strokeWidth={ICON_STROKE_WIDTH}
              aria-hidden
            />
            <span className="truncate">
              <span className="text-base-content/45">
                {LL.externalPanel.cars.driver()}:{' '}
              </span>
              <span className="font-medium">{driverName}</span>
            </span>
          </p>
        </div>

        {canManage ? (
          <div className="flex w-full flex-col gap-2 sm:items-stretch lg:w-auto lg:items-end">
            <CarCustodyActions car={car} custody={custody} />
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full border border-base-content/12 bg-base-100/45 sm:w-auto sm:px-4"
              onClick={handleOpenMqttCredentials}
            >
              <span className="flex items-center justify-center gap-2">
                <KeyRound
                  className={iconSmClassName}
                  strokeWidth={ICON_STROKE_WIDTH}
                  aria-hidden
                />
                {LL.externalPanel.cars.mqttCredentialsAction()}
              </span>
            </Button>
          </div>
        ) : null}
      </div>

      {canManage ? (
        <CarMqttCredentialsModals
          target={mqtt.mqttTarget}
          credentials={mqtt.mqttCredentials}
          mutation={mqtt.mqttMutation}
          onCloseConfirm={mqtt.closeMqttConfirm}
          onCloseCredentials={mqtt.closeMqttCredentials}
        />
      ) : null}
    </div>
  )
}

export function CarDetailLoadingHeader() {
  const { LL } = useI18nContext()

  return (
    <div className="mb-6">
      <CarDetailBackLink />
      <p className="text-sm text-base-content/50">{LL.externalPanel.cars.loading()}</p>
    </div>
  )
}
