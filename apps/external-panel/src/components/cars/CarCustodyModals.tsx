import { useI18nContext } from '@fuel-carrier/i18n/react'
import { ConfirmModal } from '@fuel-carrier/web-ui/ui'
import { CarCustodyPickerSession } from './CarCustodyPickerSession'
import type { CarCustodyApi } from './useCarCustody'

interface CarCustodyModalsProps {
  custody: CarCustodyApi
}

export function CarCustodyModals({ custody }: CarCustodyModalsProps) {
  const { LL } = useI18nContext()
  const target = custody.target
  const pickerTarget =
    target !== null && (target.mode === 'assign' || target.mode === 'change')
      ? { car: target.car, mode: target.mode }
      : null
  const isEndOpen = target !== null && target.mode === 'end'
  const endDriverName = target
    ? custody.currentDriverName(target.car)
    : LL.externalPanel.cars.noDriver()

  return (
    <>
      {pickerTarget ? (
        <CarCustodyPickerSession
          key={`${pickerTarget.car.id}-${pickerTarget.mode}`}
          car={pickerTarget.car}
          mode={pickerTarget.mode}
          custody={custody}
        />
      ) : null}

      <ConfirmModal
        open={isEndOpen}
        title={LL.externalPanel.cars.endCustodyTitle()}
        description={
          target
            ? LL.externalPanel.cars.endCustodyDescription({
                driverName: endDriverName,
                licensePlate: target.car.licensePlate,
              })
            : ''
        }
        confirmLabel={LL.externalPanel.cars.endCustodyConfirm()}
        cancelLabel={LL.externalPanel.nav.cancel()}
        confirmVariant="danger"
        loading={custody.mutation.isPending}
        loadingLabel={LL.externalPanel.cars.endingCustody()}
        onConfirm={async function confirmEndCustody() {
          if (!target) {
            return
          }

          await custody.mutation.mutateAsync({
            carId: target.car.id,
            driverId: null,
            mode: 'end',
          })
        }}
        onCancel={custody.close}
      />
    </>
  )
}
