import { useState } from 'react'
import type { Car } from '@fuel-carrier/shared-types'
import type { UpdateCarPricingDto } from '@fuel-carrier/shared-validation/car/pricing'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  CarOutputToggle,
  CarPricingModal,
  carDetailDriverChipClassName,
} from '@fuel-carrier/web-ui/cars'
import { Activity, Banknote, KeyRound, User } from '@fuel-carrier/web-ui/icons'
import { useQueryClient } from '@fuel-carrier/web-ui/query'
import {
  ContextMenu,
  ContextMenuItem,
  contextMenuItemClassName,
  ICON_STROKE_WIDTH,
  iconSmClassName,
  useToast,
} from '@fuel-carrier/web-ui/ui'
import { cn } from '@fuel-carrier/web-ui/utils'
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
      <div
        className={cn(carDetailDriverChipClassName, 'py-1 pe-1 w-full')}
      >
        <User
          className={iconSmClassName}
          strokeWidth={ICON_STROKE_WIDTH}
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate">
          <span className="text-base-content/45">
            {LL.externalPanel.cars.driver()}:{' '}
          </span>
          <span className="font-medium">{driverName}</span>
        </span>
        <ContextMenu label={LL.common.moreActions()} className="shrink-0">
            {canManage ? (
              <>
                <CarCustodyActions car={car} custody={custody} layout="menu" />
                <ContextMenuItem
                  icon={
                    <Banknote
                      className={iconSmClassName}
                      strokeWidth={ICON_STROKE_WIDTH}
                      aria-hidden
                    />
                  }
                  onClick={handleOpenPricing}
                >
                  {LL.externalPanel.cars.pricingAction()}
                </ContextMenuItem>
                <CarOutputToggle
                  carId={car.id}
                  licensePlate={car.licensePlate}
                  presentation="menu"
                />
                <ContextMenuItem
                  icon={
                    <KeyRound
                      className={iconSmClassName}
                      strokeWidth={ICON_STROKE_WIDTH}
                      aria-hidden
                    />
                  }
                  onClick={handleOpenMqttCredentials}
                >
                  {LL.externalPanel.cars.mqttCredentialsAction()}
                </ContextMenuItem>
              </>
            ) : null}
            <Link
              to="/panel/cars/$carId/telemetry"
              params={{ carId: car.id }}
              role="menuitem"
              tabIndex={-1}
              className={contextMenuItemClassName()}
            >
              <Activity
                className={iconSmClassName}
                strokeWidth={ICON_STROKE_WIDTH}
                aria-hidden
              />
              <span className="min-w-0 truncate">
                {LL.common.carTelemetry.action()}
              </span>
            </Link>
          </ContextMenu>
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
