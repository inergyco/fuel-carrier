import { useState } from 'react'
import type { Car, Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Modal, ModalActions } from '@fuel-carrier/web-ui/ui'
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

  const selectedDriver =
    custody.drivers.find(function findSelected(driver: Driver) {
      return driver.id === selectedDriverId
    }) ?? null

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
            mode === 'change' ? detail.changeConfirm() : detail.assignConfirm()
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
  )
}
