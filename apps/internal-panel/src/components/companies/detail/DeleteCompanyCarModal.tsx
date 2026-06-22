import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { UseMutationResult } from '@fuel-carrier/web-ui/query'
import { ConfirmModal } from '@fuel-carrier/web-ui/ui'

interface DeleteCompanyCarModalProps {
  target: Car | null
  mutation: UseMutationResult<void, Error, string, unknown>
  onClose: () => void
}

export function DeleteCompanyCarModal({
  target,
  mutation,
  onClose,
}: DeleteCompanyCarModalProps) {
  const { LL } = useI18nContext()

  return (
    <ConfirmModal
      open={target !== null}
      title={LL.internalPanel.companies.detail.deleteCarTitle()}
      description={
        target
          ? LL.internalPanel.companies.detail.deleteCarDescription({
              licensePlate: target.licensePlate,
            })
          : ''
      }
      confirmLabel={LL.internalPanel.companies.deleteConfirm()}
      cancelLabel={LL.internalPanel.nav.cancel()}
      confirmVariant="danger"
      loading={mutation.isPending}
      loadingLabel={LL.internalPanel.companies.deleting()}
      onConfirm={async function confirmDelete() {
        if (target) {
          await mutation.mutateAsync(target.id)
        }
      }}
      onCancel={function cancelDelete() {
        if (!mutation.isPending) {
          onClose()
        }
      }}
    />
  )
}
