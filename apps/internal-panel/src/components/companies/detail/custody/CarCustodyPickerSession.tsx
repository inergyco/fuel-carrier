import { useState } from 'react'
import type { Car, Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { ConfirmModal, Modal, ModalActions } from '@fuel-carrier/web-ui/ui'
import { CarCustodyDriverSelect } from './CarCustodyDriverSelect'
import type {
  CarCustodyPickerMode,
  CompanyCarCustodyApi,
} from './useCompanyCarCustody'

type CarCustodyPickerSessionProps = {
  car: Car
  mode: CarCustodyPickerMode
  custody: CompanyCarCustodyApi
}

export function CarCustodyPickerSession({
  car,
  mode,
  custody,
}: CarCustodyPickerSessionProps) {
  const { LL } = useI18nContext()
  const detail = LL.internalPanel.companies.detail
  const [selectedDriverId, setSelectedDriverId] = useState(() =>
    mode === 'change' ? (car.driverId ?? '') : '',
  )
  const [pendingTransfer, setPendingTransfer] = useState<{
    car: Car
    mode: CarCustodyPickerMode
    driver: Driver
  } | null>(null)

  const selectedDriver =
    custody.drivers.find(function findSelected(driver: Driver) {
      return driver.id === selectedDriverId
    }) ?? null
  const needsTransfer = Boolean(
    selectedDriver?.car && selectedDriver.car.id !== car.id,
  )

  async function submitCustody(options: {
    car: Car
    mode: CarCustodyPickerMode
    driverId: string
  }) {
    await custody.mutation.mutateAsync({
      carId: options.car.id,
      driverId: options.driverId,
      expectedDriverId: options.car.driverId,
      mode: options.mode,
    })
  }

  async function handlePickerConfirm() {
    if (!selectedDriver) {
      return
    }

    if (mode === 'change' && selectedDriver.id === car.driverId) {
      custody.close()
      return
    }

    if (needsTransfer) {
      setPendingTransfer({ car, mode, driver: selectedDriver })
      return
    }

    await submitCustody({ car, mode, driverId: selectedDriver.id })
  }

  return (
    <>
      <Modal
        open
        size="sm"
        title={
          mode === 'change'
            ? detail.changeDriverTitle()
            : detail.assignDriverTitle()
        }
        description={
          mode === 'change'
            ? detail.changeDriverDescription()
            : detail.assignDriverDescription()
        }
        onClose={custody.close}
        closeDisabled={custody.mutation.isPending}
        footer={
          <ModalActions
            cancelLabel={LL.internalPanel.nav.cancel()}
            confirmLabel={
              mode === 'change'
                ? detail.changeConfirm()
                : detail.assignConfirm()
            }
            onCancel={custody.close}
            onConfirm={handlePickerConfirm}
            loading={custody.mutation.isPending}
            loadingLabel={detail.assigning()}
            confirmDisabled={!selectedDriverId || custody.driversLoading}
          />
        }
      >
        <CarCustodyDriverSelect
          car={car}
          custody={custody}
          selectedDriverId={selectedDriverId}
          onChange={setSelectedDriverId}
        />
      </Modal>

      <ConfirmModal
        open={pendingTransfer !== null}
        title={detail.transferConfirmTitle()}
        description={
          pendingTransfer
            ? detail.transferConfirmDescription({
                driverName: custody.driverLabel(pendingTransfer.driver),
                otherPlate: pendingTransfer.driver.car!.licensePlate,
              })
            : ''
        }
        confirmLabel={detail.transferConfirm()}
        cancelLabel={LL.internalPanel.nav.cancel()}
        loading={custody.mutation.isPending}
        loadingLabel={detail.assigning()}
        onConfirm={async function confirmTransfer() {
          if (!pendingTransfer) {
            return
          }

          await submitCustody({
            car: pendingTransfer.car,
            mode: pendingTransfer.mode,
            driverId: pendingTransfer.driver.id,
          })
          setPendingTransfer(null)
        }}
        onCancel={function cancelTransfer() {
          if (!custody.mutation.isPending) {
            setPendingTransfer(null)
          }
        }}
      />
    </>
  )
}
