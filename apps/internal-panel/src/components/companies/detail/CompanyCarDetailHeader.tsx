import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { KeyRound, User } from '@fuel-carrier/web-ui/icons'
import {
  Button,
  ICON_STROKE_WIDTH,
  iconSmClassName,
} from '@fuel-carrier/web-ui/ui'
import { CompanyCarDetailBackLink } from './CompanyCarDetailBackLink'
import { CarMqttCredentialsModals } from './CarMqttCredentialsModals'
import { CarCustodyActions } from './custody/CarCustodyActions'
import type { CompanyCarCustodyApi } from './custody/useCompanyCarCustody'
import { useCompanyCarMqttCredentials } from './useCompanyCarMqttCredentials'

type CompanyCarDetailHeaderProps = {
  companyId: string
  car?: Car
  title?: string
  custody?: CompanyCarCustodyApi
}

export function CompanyCarDetailHeader({
  companyId,
  car,
  title,
  custody,
}: CompanyCarDetailHeaderProps) {
  const { LL } = useI18nContext()
  const mqtt = useCompanyCarMqttCredentials()
  const detail = LL.internalPanel.companies.detail
  const heading =
    title ??
    (car?.name?.trim() || car?.licensePlate || detail.carDetailTitle())
  const driverName = car && custody ? custody.currentDriverName(car) : null

  function handleOpenMqttCredentials() {
    if (car) {
      mqtt.openMqttCredentials(car)
    }
  }

  return (
    <div className="mb-6">
      <CompanyCarDetailBackLink companyId={companyId} />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            {heading}
          </h2>
          {car ? (
            <p className="mt-1 font-mono text-sm text-base-content/50">
              {car.licensePlate}
            </p>
          ) : null}
          {car && driverName ? (
            <p className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg border border-base-content/10 bg-base-100/40 px-3 py-2 text-sm">
              <User
                className={iconSmClassName}
                strokeWidth={ICON_STROKE_WIDTH}
                aria-hidden
              />
              <span className="truncate">
                <span className="text-base-content/45">{detail.driver()}: </span>
                <span className="font-medium">{driverName}</span>
              </span>
            </p>
          ) : null}
        </div>

        {car ? (
          <div className="flex w-full flex-col gap-2 sm:items-stretch lg:w-auto lg:items-end">
            {custody ? (
              <CarCustodyActions car={car} custody={custody} />
            ) : null}
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
                {detail.mqttCredentialsAction()}
              </span>
            </Button>
          </div>
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
