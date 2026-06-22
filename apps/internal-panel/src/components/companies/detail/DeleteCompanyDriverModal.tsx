import type { Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { UseMutationResult } from '@fuel-carrier/web-ui/query'
import { ConfirmModal } from '@fuel-carrier/web-ui/ui'

interface DeleteCompanyDriverModalProps {
  target: Driver | null
  mutation: UseMutationResult<void, Error, string, unknown>
  onClose: () => void
}

export function DeleteCompanyDriverModal({
  target,
  mutation,
  onClose,
}: DeleteCompanyDriverModalProps) {
  const { LL } = useI18nContext()

  return (
    <ConfirmModal
      open={target !== null}
      title={LL.internalPanel.companies.detail.deleteDriverTitle()}
      description={
        target
          ? LL.internalPanel.companies.detail.deleteDriverDescription({
              name: `${target.firstName} ${target.lastName}`,
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
