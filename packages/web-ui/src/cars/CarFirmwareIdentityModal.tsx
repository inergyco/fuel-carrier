import type { Car } from '@fuel-carrier/shared-types'
import { Button, CopyableCredentialField, Modal } from '../ui'

export type CarFirmwareIdentityModalLabels = {
  title: () => string
  description: () => string
  firmwareCompanyId: () => string
  firmwareDeviceId: () => string
  empty: () => string
  dismiss: () => string
}

export type CarFirmwareIdentityModalProps = {
  open: boolean
  car: Car | null
  labels: CarFirmwareIdentityModalLabels
  onClose: () => void
}

/** Read-only peek at human-readable firmware IDs for a car. */
export function CarFirmwareIdentityModal({
  open,
  car,
  labels,
  onClose,
}: CarFirmwareIdentityModalProps) {
  const empty = labels.empty()

  return (
    <Modal
      open={open}
      title={labels.title()}
      description={labels.description()}
      onClose={onClose}
      footer={
        <Button
          type="button"
          className="h-11 min-h-11 w-full sm:w-auto sm:px-6"
          onClick={onClose}
        >
          {labels.dismiss()}
        </Button>
      }
    >
      {car ? (
        <div className="flex flex-col gap-4">
          <CopyableCredentialField
            label={labels.firmwareCompanyId()}
            value={car.firmwareCompanyId?.trim() || empty}
          />
          <CopyableCredentialField
            label={labels.firmwareDeviceId()}
            value={car.firmwareDeviceId?.trim() || empty}
          />
        </div>
      ) : null}
    </Modal>
  )
}
