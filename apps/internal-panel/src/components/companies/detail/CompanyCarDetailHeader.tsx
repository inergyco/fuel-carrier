import { useState } from 'react'
import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  CarFirmwareIdentityModal,
  CarOutputControls,
  carDetailActionClassName,
  carDetailActionRowClassName,
  carDetailDriverChipClassName,
  useCarOutputCommand,
} from '@fuel-carrier/web-ui/cars'
import { Activity, Cpu, KeyRound, User } from '@fuel-carrier/web-ui/icons'
import {
  Button,
  ICON_STROKE_WIDTH,
  iconSmClassName,
} from '@fuel-carrier/web-ui/ui'
import { Link } from '@tanstack/react-router'
import { CarMqttCredentialsModals } from './CarMqttCredentialsModals'
import { CarCustodyActions } from './custody/CarCustodyActions'
import type { CompanyCarCustodyApi } from './custody/useCompanyCarCustody'
import { useCompanyCarMqttCredentials } from './useCompanyCarMqttCredentials'

type CompanyCarDetailHeaderProps = {
  car: Car
  custody: CompanyCarCustodyApi
}

export function CompanyCarDetailHeader({
  car,
  custody,
}: CompanyCarDetailHeaderProps) {
  const { LL } = useI18nContext()
  const mqtt = useCompanyCarMqttCredentials()
  const outputs = useCarOutputCommand()
  const [firmwareOpen, setFirmwareOpen] = useState(false)
  const detail = LL.internalPanel.companies.detail
  const driverName = custody.currentDriverName(car)

  function handleOpenMqttCredentials() {
    mqtt.openMqttCredentials(car)
  }

  function handleOpenFirmwareIdentity() {
    setFirmwareOpen(true)
  }

  function handleCloseFirmwareIdentity() {
    setFirmwareOpen(false)
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
          <span className="text-base-content/45">{detail.driver()}: </span>
          <span className="font-medium">{driverName}</span>
        </span>
      </p>

      <div className={carDetailActionRowClassName}>
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
          onClick={handleOpenFirmwareIdentity}
        >
          <span className="flex items-center justify-center gap-2 whitespace-nowrap">
            <Cpu
              className={iconSmClassName}
              strokeWidth={ICON_STROKE_WIDTH}
              aria-hidden
            />
            {detail.firmwareIdentityAction()}
          </span>
        </Button>
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
            {detail.mqttCredentialsAction()}
          </span>
        </Button>
        <Link
          to="/companies/$companyId/cars/$carId/telemetry"
          params={{ companyId: car.companyId, carId: car.id }}
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

      <CarFirmwareIdentityModal
        open={firmwareOpen}
        car={car}
        labels={{
          title: detail.firmwareIdentityTitle,
          description: detail.firmwareIdentityDescription,
          firmwareCompanyId: detail.firmwareCompanyId,
          firmwareDeviceId: detail.firmwareDeviceId,
          empty: LL.internalPanel.companies.emptyCell,
          dismiss: detail.firmwareIdentityDismiss,
        }}
        onClose={handleCloseFirmwareIdentity}
      />

      <CarMqttCredentialsModals
        target={mqtt.mqttTarget}
        credentials={mqtt.mqttCredentials}
        mutation={mqtt.mqttMutation}
        onCloseConfirm={mqtt.closeMqttConfirm}
        onCloseCredentials={mqtt.closeMqttCredentials}
      />
    </div>
  )
}
