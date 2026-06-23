import type { CompanyUser } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Form } from '@fuel-carrier/web-ui/form'
import { Modal, ModalActions } from '@fuel-carrier/web-ui/ui'
import { CompanyUserFormFields } from './CompanyUserFormFields'
import type { CompanyUserFormModalMode } from './company-user-form.schema'
import { useCompanyUserFormModal } from './useCompanyUserFormModal'

interface CompanyUserFormModalProps {
  mode: CompanyUserFormModalMode
  user?: CompanyUser
  onClose: () => void
  onSuccess: () => void
}

export function CompanyUserFormModal({
  mode,
  user,
  onClose,
  onSuccess,
}: CompanyUserFormModalProps) {
  const { LL } = useI18nContext()
  const { form, serverError, isSaving, title, confirmLabel, onSubmit, handleClose } =
    useCompanyUserFormModal({
      mode,
      user,
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
          confirmForm="company-user-form"
          loading={isSaving}
          loadingLabel={LL.externalPanel.users.updating()}
          onCancel={handleClose}
          cancelDisabled={isSaving}
        />
      }
    >
      <Form
        form={form}
        id="company-user-form"
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        <CompanyUserFormFields mode={mode} serverError={serverError} />
      </Form>
    </Modal>
  )
}
