import { useState } from 'react'
import type { Car } from '@fuel-carrier/shared-types'
import type { UpdateCarPricingDto } from '@fuel-carrier/shared-validation/car/pricing'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  CarFirmwareIdentityModal,
  CarOutputToggle,
  CarPricingModal,
  carDetailActionClassName,
  carDetailActionRowClassName,
  carDetailDriverChipClassName,
} from '@fuel-carrier/web-ui/cars'
import { Activity, Banknote, Cpu, KeyRound, User } from '@fuel-carrier/web-ui/icons'
import { useQueryClient } from '@fuel-carrier/web-ui/query'
import {
  Button,
  ConfirmModal,
  ICON_STROKE_WIDTH,
  iconSmClassName,
  useToast,
} from '@fuel-carrier/web-ui/ui'
import { Link } from '@tanstack/react-router'
import { CarMqttCredentialsModals } from './CarMqttCredentialsModals'
import { CarCustodyActions } from './custody/CarCustodyActions'
import type { CompanyCarCustodyApi } from './custody/useCompanyCarCustody'
import { carKeys, updateCarPricing } from '../../../lib/api/cars'
import { useCompanyCarFirmwareIdentity } from './useCompanyCarFirmwareIdentity'
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
  const firmware = useCompanyCarFirmwareIdentity(car)
  const queryClient = useQueryClient()
  const toast = useToast()
  const [pricingOpen, setPricingOpen] = useState(false)
  const detail = LL.internalPanel.companies.detail
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
    toast.success(LL.internalPanel.toast.pricingUpdated())
  }

  const emptyFirmwareLabel = LL.internalPanel.companies.emptyCell()

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
            {detail.pricingAction()}
          </span>
        </Button>
        <CarOutputToggle carId={car.id} licensePlate={car.licensePlate} />
        <Button
          type="button"
          variant="ghost"
          className={carDetailActionClassName}
          onClick={firmware.openModal}
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

      <CarPricingModal
        open={pricingOpen}
        car={car}
        onClose={handleClosePricing}
        savePricing={handleSavePricing}
      />

      <CarFirmwareIdentityModal
        open={firmware.open}
        car={car}
        mode={firmware.mode}
        draft={firmware.draft}
        continueDisabled={firmware.continueDisabled}
        labels={{
          title: detail.firmwareIdentityTitle,
          description: detail.firmwareIdentityDescription,
          editDescription: detail.firmwareIdentityEditDescription,
          firmwareCompanyId: detail.firmwareCompanyId,
          firmwareDeviceId: detail.firmwareDeviceId,
          empty: LL.internalPanel.companies.emptyCell,
          dismiss: detail.firmwareIdentityDismiss,
          edit: detail.firmwareIdentityEdit,
          cancel: LL.internalPanel.nav.cancel,
          continue: detail.firmwareIdentityContinue,
        }}
        onClose={firmware.closeModal}
        onEdit={firmware.startEdit}
        onCancelEdit={firmware.cancelEdit}
        onDraftChange={firmware.setDraft}
        onContinue={firmware.continueToConfirm}
      />

      <ConfirmModal
        open={firmware.confirmOpen}
        title={detail.firmwareIdentityConfirmTitle()}
        description={detail.firmwareIdentityConfirmDescription({
          licensePlate: car.licensePlate,
          firmwareCompanyId:
            firmware.draft.firmwareCompanyId.trim() || emptyFirmwareLabel,
          firmwareDeviceId:
            firmware.draft.firmwareDeviceId.trim() || emptyFirmwareLabel,
        })}
        confirmLabel={detail.firmwareIdentityConfirm()}
        cancelLabel={LL.internalPanel.nav.cancel()}
        loading={firmware.isPending}
        loadingLabel={detail.firmwareIdentityUpdating()}
        onConfirm={firmware.confirmSave}
        onCancel={firmware.cancelConfirm}
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
