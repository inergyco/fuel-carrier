import { useState } from 'react'
import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Modal, ModalActions } from '@fuel-carrier/web-ui/ui'
import { CarCustodyDriverSelect } from './CarCustodyDriverSelect'
import type { CarCustodyApi, CarCustodyPickerMode } from './useCarCustody'

interface CarCustodyPickerSessionProps {
  car: Car
  mode: CarCustodyPickerMode
  custody: CarCustodyApi
}

export function CarCustodyPickerSession({
  car,
  mode,
  custody,
}: CarCustodyPickerSessionProps) {
  const { LL } = useI18nContext()
  const [selectedDriverId, setSelectedDriverId] = useState(() =>
    mode === 'change' ? (car.driverId ?? '') : '',
  )

  const selectedDriver =
    custody.drivers.find((driver) => driver.id === selectedDriverId) ?? null

  async function handlePickerConfirm() {
    if (!selectedDriver) {
      return
    }

    if (mode === 'change' && selectedDriver.id === car.driverId) {
      custody.close()
      return
    }

    await custody.mutation.mutateAsync({
      carId: car.id,
      driverId: selectedDriver.id,
      expectedDriverId: car.driverId,
      mode,
    })
  }

  return (
    <Modal
      open
      size="sm"
      title={
        mode === 'change'
          ? LL.externalPanel.cars.changeDriverTitle()
          : LL.externalPanel.cars.assignDriverTitle()
      }
      description={
        mode === 'change'
          ? LL.externalPanel.cars.changeDriverDescription()
          : LL.externalPanel.cars.assignDriverDescription()
      }
      onClose={custody.close}
      closeDisabled={custody.mutation.isPending}
      footer={
        <ModalActions
          cancelLabel={LL.externalPanel.nav.cancel()}
          confirmLabel={
            mode === 'change'
              ? LL.externalPanel.cars.changeConfirm()
              : LL.externalPanel.cars.assignConfirm()
          }
          onCancel={custody.close}
          onConfirm={handlePickerConfirm}
          loading={custody.mutation.isPending}
          loadingLabel={LL.externalPanel.cars.assigning()}
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
  )
}
