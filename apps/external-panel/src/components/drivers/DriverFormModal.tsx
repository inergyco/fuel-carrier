import type { Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Form } from '@fuel-carrier/web-ui/form'
import { Modal, ModalActions } from '@fuel-carrier/web-ui/ui'
import { DriverFormFields } from './DriverFormFields'
import type { DriverFormModalMode } from './driver-form.schema'
import { useDriverFormModal } from './useDriverFormModal'

interface DriverFormModalProps {
  mode: DriverFormModalMode
  driver?: Driver
  onClose: () => void
  onSuccess: () => void
}

export function DriverFormModal({
  mode,
  driver,
  onClose,
  onSuccess,
}: DriverFormModalProps) {
  const { LL } = useI18nContext()
  const { form, serverError, isSaving, title, confirmLabel, onSubmit, handleClose } =
    useDriverFormModal({
      mode,
      driver,
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
          confirmForm="driver-form"
          loading={isSaving}
          loadingLabel={LL.externalPanel.drivers.updating()}
          onCancel={handleClose}
          cancelDisabled={isSaving}
        />
      }
    >
      <Form
        form={form}
        id="driver-form"
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        <DriverFormFields serverError={serverError} />
      </Form>
    </Modal>
  )
}
