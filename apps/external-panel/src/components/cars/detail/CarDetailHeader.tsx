import { useState } from 'react'
import type { Car } from '@fuel-carrier/shared-types'
import type { UpdateCarPricingDto } from '@fuel-carrier/shared-validation/car/pricing'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  CarOutputToggle,
  CarPricingModal,
  carDetailActionClassName,
  carDetailActionRowClassName,
  carDetailDriverChipClassName,
} from '@fuel-carrier/web-ui/cars'
import { Activity, Banknote, KeyRound, User } from '@fuel-carrier/web-ui/icons'
import { useQueryClient } from '@fuel-carrier/web-ui/query'
import {
  Button,
  ICON_STROKE_WIDTH,
  iconSmClassName,
  useToast,
} from '@fuel-carrier/web-ui/ui'
import { Link } from '@tanstack/react-router'
import { carKeys, updateCarPricing } from '../../../lib/api/cars'
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
  const queryClient = useQueryClient()
  const toast = useToast()
  const [pricingOpen, setPricingOpen] = useState(false)
  const driverName = custody.currentDriverName(car)

  function handleOpenMqttCredentials() {
    mqtt.openMqttCredentials(car)
  }

  function handleOpenPricing() {
    setPricingOpen(true)
  }

  function handleClosePricing() {
    setPricingOpen(false)
  }

  async function handleSavePricing(dto: UpdateCarPricingDto) {
    await updateCarPricing(car.id, dto)
    await queryClient.invalidateQueries({ queryKey: carKeys.all })
    toast.success(LL.externalPanel.toast.pricingUpdated())
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
            <Button
              type="button"
              variant="ghost"
              className={carDetailActionClassName}
              onClick={handleOpenPricing}
            >
              <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                <Banknote
                  className={iconSmClassName}
                  strokeWidth={ICON_STROKE_WIDTH}
                  aria-hidden
                />
                {LL.externalPanel.cars.pricingAction()}
              </span>
            </Button>
            <CarOutputToggle carId={car.id} licensePlate={car.licensePlate} />
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
        <>
          <CarPricingModal
            open={pricingOpen}
            car={car}
            onClose={handleClosePricing}
            savePricing={handleSavePricing}
          />
          <CarMqttCredentialsModals
            target={mqtt.mqttTarget}
            credentials={mqtt.mqttCredentials}
            mutation={mqtt.mqttMutation}
            onCloseConfirm={mqtt.closeMqttConfirm}
            onCloseCredentials={mqtt.closeMqttCredentials}
          />
        </>
      ) : null}
    </div>
  )
}
