import type { CompanyUser } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { UseMutationResult } from '@fuel-carrier/web-ui/query'
import { ConfirmModal } from '@fuel-carrier/web-ui/ui'

interface DeleteCompanyUserModalProps {
  target: CompanyUser | null
  mutation: UseMutationResult<void, Error, string, unknown>
  onClose: () => void
}

export function DeleteCompanyUserModal({
  target,
  mutation,
  onClose,
}: DeleteCompanyUserModalProps) {
  const { LL } = useI18nContext()

  return (
    <ConfirmModal
      open={target !== null}
      title={LL.externalPanel.users.deleteTitle()}
      description={
        target
          ? LL.externalPanel.users.deleteDescription({
              name: `${target.firstName} ${target.lastName}`,
            })
          : ''
      }
      confirmLabel={LL.externalPanel.users.deleteConfirm()}
      cancelLabel={LL.externalPanel.nav.cancel()}
      confirmVariant="danger"
      loading={mutation.isPending}
      loadingLabel={LL.externalPanel.users.deleting()}
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
