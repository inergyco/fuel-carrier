import type { Car, Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Form } from '@fuel-carrier/web-ui/form'
import { Modal, ModalActions } from '@fuel-carrier/web-ui/ui'
import { CarFormFields } from './CarFormFields'
import type { CarFormModalMode } from './car-form.schema'
import { useCarFormModal } from './useCarFormModal'

interface CarFormModalProps {
  mode: CarFormModalMode
  car?: Car
  drivers: Driver[]
  onClose: () => void
  onSuccess: () => void
}

export function CarFormModal({
  mode,
  car,
  drivers,
  onClose,
  onSuccess,
}: CarFormModalProps) {
  const { LL } = useI18nContext()
  const { form, serverError, isSaving, title, confirmLabel, onSubmit, handleClose } =
    useCarFormModal({
      mode,
      car,
      onClose,
      onSuccess,
    })

  return (
    <Modal
      open
      title={title}
      onClose={handleClose}
      closeDisabled={isSaving}
      footer={
        <ModalActions
          cancelLabel={LL.externalPanel.nav.cancel()}
          confirmLabel={confirmLabel}
          confirmType="submit"
          confirmForm="car-form"
          loading={isSaving}
          loadingLabel={LL.externalPanel.cars.updating()}
          onCancel={handleClose}
          cancelDisabled={isSaving}
        />
      }
    >
      <Form
        form={form}
        id="car-form"
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        <CarFormFields drivers={drivers} serverError={serverError} />
      </Form>
    </Modal>
  )
}
