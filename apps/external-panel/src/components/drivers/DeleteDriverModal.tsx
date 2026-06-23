import type { Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { UseMutationResult } from '@fuel-carrier/web-ui/query'
import { ConfirmModal } from '@fuel-carrier/web-ui/ui'

interface DeleteDriverModalProps {
  target: Driver | null
  mutation: UseMutationResult<void, Error, string, unknown>
  onClose: () => void
}

export function DeleteDriverModal({
  target,
  mutation,
  onClose,
}: DeleteDriverModalProps) {
  const { LL } = useI18nContext()

  return (
    <ConfirmModal
      open={target !== null}
      title={LL.externalPanel.drivers.deleteTitle()}
      description={
        target
          ? LL.externalPanel.drivers.deleteDescription({
              name: `${target.firstName} ${target.lastName}`,
            })
          : ''
      }
      confirmLabel={LL.externalPanel.drivers.deleteConfirm()}
      cancelLabel={LL.externalPanel.nav.cancel()}
      confirmVariant="danger"
      loading={mutation.isPending}
      loadingLabel={LL.externalPanel.drivers.deleting()}
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
