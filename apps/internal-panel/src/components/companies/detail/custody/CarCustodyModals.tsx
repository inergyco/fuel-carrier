import { useI18nContext } from '@fuel-carrier/i18n/react'
import { ConfirmModal } from '@fuel-carrier/web-ui/ui'
import { CarCustodyPickerSession } from './CarCustodyPickerSession'
import type { CompanyCarCustodyApi } from './useCompanyCarCustody'

type CarCustodyModalsProps = {
  custody: CompanyCarCustodyApi
}

export function CarCustodyModals({ custody }: CarCustodyModalsProps) {
  const { LL } = useI18nContext()
  const detail = LL.internalPanel.companies.detail
  const target = custody.target
  const pickerTarget =
    target !== null && (target.mode === 'assign' || target.mode === 'change')
      ? { car: target.car, mode: target.mode }
      : null
  const isEndOpen = target !== null && target.mode === 'end'
  const endDriverName = target
    ? custody.currentDriverName(target.car)
    : detail.noDriver()

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
        title={detail.endCustodyTitle()}
        description={
          target
            ? detail.endCustodyDescription({
                driverName: endDriverName,
                licensePlate: target.car.licensePlate,
              })
            : ''
        }
        confirmLabel={detail.endCustodyConfirm()}
        cancelLabel={LL.internalPanel.nav.cancel()}
        confirmVariant="danger"
        loading={custody.mutation.isPending}
        loadingLabel={detail.endingCustody()}
        onConfirm={async function confirmEndCustody() {
          if (!target) {
            return
          }

          await custody.mutation.mutateAsync({
            carId: target.car.id,
            driverId: null,
            expectedDriverId: target.car.driverId,
            mode: 'end',
          })
        }}
        onCancel={custody.close}
      />
    </>
  )
}
