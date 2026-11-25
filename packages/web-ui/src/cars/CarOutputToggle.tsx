import { useI18nContext } from '@fuel-carrier/i18n/react'
import { ConfirmModal, LicensePlate } from '../ui'
import { CarOutputControls } from './CarOutputControls'
import { useCarOutputCommand } from './useCarOutputCommand'

export type CarOutputToggleProps = {
  carId: string
  licensePlate: string
  disabled?: boolean
  presentation?: 'toolbar' | 'menu'
}

/** Enable/disable truck outputs with an explicit confirmation step. */
export function CarOutputToggle({
  carId,
  licensePlate,
  disabled = false,
  presentation = 'toolbar',
}: CarOutputToggleProps) {
  const { LL } = useI18nContext()
  const outputs = useCarOutputCommand()
  const labels = LL.common.carOutput
  const willDisable = outputs.willDisable

  function handleRequestToggle() {
    outputs.requestToggle(carId)
  }

  return (
    <>
      <CarOutputControls
        active={outputs.active}
        pending={outputs.isPending}
        disabled={disabled}
        presentation={presentation}
        onToggle={handleRequestToggle}
      />
      <ConfirmModal
        open={outputs.confirmOpen}
        title={
          willDisable
            ? labels.disableConfirmTitle()
            : labels.enableConfirmTitle()
        }
        description={
          willDisable
            ? labels.disableConfirmDescription()
            : labels.enableConfirmDescription()
        }
        confirmLabel={willDisable ? labels.disable() : labels.enable()}
        cancelLabel={LL.common.cancel()}
        confirmVariant={willDisable ? 'danger' : 'primary'}
        loading={outputs.isPending}
        loadingLabel={willDisable ? labels.disabling() : labels.enabling()}
        onConfirm={outputs.confirmToggle}
        onCancel={outputs.cancelToggle}
      >
        <div className="flex justify-center">
          <LicensePlate value={licensePlate} size="md" />
        </div>
      </ConfirmModal>
    </>
  )
}
