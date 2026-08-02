import type { Car } from '@fuel-carrier/shared-types'
import { isCompanyUserAdmin } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { KeyRound } from '@fuel-carrier/web-ui/icons'
import {
  Button,
  ICON_STROKE_WIDTH,
  iconSmClassName,
} from '@fuel-carrier/web-ui/ui'
import { getRouteApi } from '@tanstack/react-router'
import { CarMqttCredentialsModals } from '../CarMqttCredentialsModals'
import { useCarMqttCredentials } from '../useCarMqttCredentials'
import { CarDetailBackLink } from './CarDetailBackLink'

const authenticatedRouteApi = getRouteApi('/_authenticated')

interface CarDetailHeaderProps {
  car: Car
}

export function CarDetailHeader({ car }: CarDetailHeaderProps) {
  const { LL } = useI18nContext()
  const { user } = authenticatedRouteApi.useRouteContext()
  const canManage = isCompanyUserAdmin(user)
  const mqtt = useCarMqttCredentials()
  const title =
    car.name?.trim() || car.licensePlate || LL.externalPanel.cars.detailTitle()

  function handleOpenMqttCredentials() {
    mqtt.openMqttCredentials(car)
  }

  return (
    <div className="mb-6">
      <CarDetailBackLink />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          <p className="mt-1 font-mono text-sm text-base-content/50">
            {car.licensePlate}
          </p>
        </div>
        {canManage ? (
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-full border border-base-content/12 bg-base-100/45 sm:w-auto sm:px-4"
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
        ) : null}
      </div>

      {canManage ? (
        <CarMqttCredentialsModals
          target={mqtt.mqttTarget}
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
