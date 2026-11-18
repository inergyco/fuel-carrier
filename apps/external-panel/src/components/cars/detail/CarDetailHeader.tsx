import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  CarOutputControls,
  carDetailActionClassName,
  carDetailActionRowClassName,
  carDetailDriverChipClassName,
  useCarOutputCommand,
} from '@fuel-carrier/web-ui/cars'
import { Activity, KeyRound, User } from '@fuel-carrier/web-ui/icons'
import {
  Button,
  ICON_STROKE_WIDTH,
  iconSmClassName,
} from '@fuel-carrier/web-ui/ui'
import { Link } from '@tanstack/react-router'
import { CarMqttCredentialsModals } from '../CarMqttCredentialsModals'
import { useCarMqttCredentials } from '../useCarMqttCredentials'
import { CarCustodyActions } from '../CarCustodyActions'
import type { CarCustodyApi } from '../useCarCustody'

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
  const outputs = useCarOutputCommand()
  const driverName = custody.currentDriverName(car)

  function handleOpenMqttCredentials() {
    mqtt.openMqttCredentials(car)
  }

  function handleToggleOutputs() {
    outputs.toggle(car.id)
  }

  return (
    <div className="mb-6 flex flex-col gap-4">
      <p className={carDetailDriverChipClassName}>
        <User
          className={iconSmClassName}
          strokeWidth={ICON_STROKE_WIDTH}
          aria-hidden
        />
        <span className="min-w-0 truncate">
          <span className="text-base-content/45">
            {LL.externalPanel.cars.driver()}:{' '}
          </span>
          <span className="font-medium">{driverName}</span>
        </span>
      </p>

      <div className={carDetailActionRowClassName}>
        {canManage ? (
          <>
            <CarCustodyActions car={car} custody={custody} />
            <CarOutputControls
              active={outputs.active}
              pending={outputs.isPending}
              onToggle={handleToggleOutputs}
            />
            <Button
              type="button"
              variant="ghost"
              className={carDetailActionClassName}
              onClick={handleOpenMqttCredentials}
            >
              <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                <KeyRound
                  className={iconSmClassName}
                  strokeWidth={ICON_STROKE_WIDTH}
                  aria-hidden
                />
                {LL.externalPanel.cars.mqttCredentialsAction()}
              </span>
            </Button>
          </>
        ) : null}
        <Link
          to="/panel/cars/$carId/telemetry"
          params={{ carId: car.id }}
          className={`btn btn-ghost inline-flex items-center justify-center gap-2 font-normal normal-case tracking-normal ${carDetailActionClassName}`}
        >
          <Activity
            className={iconSmClassName}
            strokeWidth={ICON_STROKE_WIDTH}
            aria-hidden
          />
          {LL.common.carTelemetry.action()}
        </Link>
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
