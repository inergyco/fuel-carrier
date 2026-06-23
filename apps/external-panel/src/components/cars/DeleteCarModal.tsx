import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { UseMutationResult } from '@fuel-carrier/web-ui/query'
import { ConfirmModal } from '@fuel-carrier/web-ui/ui'

interface DeleteCarModalProps {
  target: Car | null
  mutation: UseMutationResult<void, Error, string, unknown>
  onClose: () => void
}

export function DeleteCarModal({
  target,
  mutation,
  onClose,
}: DeleteCarModalProps) {
  const { LL } = useI18nContext()

  return (
    <ConfirmModal
      open={target !== null}
      title={LL.externalPanel.cars.deleteTitle()}
      description={
        target
          ? LL.externalPanel.cars.deleteDescription({
              licensePlate: target.licensePlate,
            })
          : ''
      }
      confirmLabel={LL.externalPanel.cars.deleteConfirm()}
      cancelLabel={LL.externalPanel.nav.cancel()}
      confirmVariant="danger"
      loading={mutation.isPending}
      loadingLabel={LL.externalPanel.cars.deleting()}
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
