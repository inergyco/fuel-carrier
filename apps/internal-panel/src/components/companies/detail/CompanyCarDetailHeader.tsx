import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { KeyRound } from '@fuel-carrier/web-ui/icons'
import {
  Button,
  ICON_STROKE_WIDTH,
  iconSmClassName,
} from '@fuel-carrier/web-ui/ui'
import { CompanyCarDetailBackLink } from './CompanyCarDetailBackLink'
import { CarMqttCredentialsModals } from './CarMqttCredentialsModals'
import { useCompanyCarMqttCredentials } from './useCompanyCarMqttCredentials'

type CompanyCarDetailHeaderProps = {
  companyId: string
  car?: Car
  title?: string
}

export function CompanyCarDetailHeader({
  companyId,
  car,
  title,
}: CompanyCarDetailHeaderProps) {
  const { LL } = useI18nContext()
  const mqtt = useCompanyCarMqttCredentials()
  const heading =
    title ??
    (car?.name?.trim() ||
      car?.licensePlate ||
      LL.internalPanel.companies.detail.carDetailTitle())

  function handleOpenMqttCredentials() {
    if (car) {
      mqtt.openMqttCredentials(car)
    }
  }

  return (
    <div className="mb-6">
      <CompanyCarDetailBackLink companyId={companyId} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            {heading}
          </h2>
          {car ? (
            <p className="mt-1 font-mono text-sm text-base-content/50">
              {car.licensePlate}
            </p>
          ) : null}
        </div>
        {car ? (
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
              {LL.internalPanel.companies.detail.mqttCredentialsAction()}
            </span>
          </Button>
        ) : null}
      </div>

      {car ? (
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
