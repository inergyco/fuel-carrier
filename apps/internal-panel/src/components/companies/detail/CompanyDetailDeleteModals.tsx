import type { Car, CompanyUser, Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { UseMutationResult } from '@fuel-carrier/web-ui/query'
import { ConfirmModal } from '@fuel-carrier/web-ui/ui'

interface CompanyDetailDeleteModalsProps {
  deleteUserTarget: CompanyUser | null
  setDeleteUserTarget: (user: CompanyUser | null) => void
  deleteDriverTarget: Driver | null
  setDeleteDriverTarget: (driver: Driver | null) => void
  deleteCarTarget: Car | null
  setDeleteCarTarget: (car: Car | null) => void
  deleteUserMutation: UseMutationResult<void, Error, string, unknown>
  deleteDriverMutation: UseMutationResult<void, Error, string, unknown>
  deleteCarMutation: UseMutationResult<void, Error, string, unknown>
}

export function CompanyDetailDeleteModals({
  deleteUserTarget,
  setDeleteUserTarget,
  deleteDriverTarget,
  setDeleteDriverTarget,
  deleteCarTarget,
  setDeleteCarTarget,
  deleteUserMutation,
  deleteDriverMutation,
  deleteCarMutation,
}: CompanyDetailDeleteModalsProps) {
  const { LL } = useI18nContext()

  return (
    <>
      <ConfirmModal
        open={deleteUserTarget !== null}
        title={LL.internalPanel.companies.detail.deleteUserTitle()}
        description={
          deleteUserTarget
            ? LL.internalPanel.companies.detail.deleteUserDescription({
                name: `${deleteUserTarget.firstName} ${deleteUserTarget.lastName}`,
              })
            : ''
        }
        confirmLabel={LL.internalPanel.companies.deleteConfirm()}
        cancelLabel={LL.internalPanel.nav.cancel()}
        confirmVariant="danger"
        loading={deleteUserMutation.isPending}
        loadingLabel={LL.internalPanel.companies.deleting()}
        onConfirm={async function confirmDeleteUser() {
          if (deleteUserTarget) {
            await deleteUserMutation.mutateAsync(deleteUserTarget.id)
          }
        }}
        onCancel={function cancelDeleteUser() {
          if (!deleteUserMutation.isPending) {
            setDeleteUserTarget(null)
          }
        }}
      />

      <ConfirmModal
        open={deleteDriverTarget !== null}
        title={LL.internalPanel.companies.detail.deleteDriverTitle()}
        description={
          deleteDriverTarget
            ? LL.internalPanel.companies.detail.deleteDriverDescription({
                name: `${deleteDriverTarget.firstName} ${deleteDriverTarget.lastName}`,
              })
            : ''
        }
        confirmLabel={LL.internalPanel.companies.deleteConfirm()}
        cancelLabel={LL.internalPanel.nav.cancel()}
        confirmVariant="danger"
        loading={deleteDriverMutation.isPending}
        loadingLabel={LL.internalPanel.companies.deleting()}
        onConfirm={async function confirmDeleteDriver() {
          if (deleteDriverTarget) {
            await deleteDriverMutation.mutateAsync(deleteDriverTarget.id)
          }
        }}
        onCancel={function cancelDeleteDriver() {
          if (!deleteDriverMutation.isPending) {
            setDeleteDriverTarget(null)
          }
        }}
      />

      <ConfirmModal
        open={deleteCarTarget !== null}
        title={LL.internalPanel.companies.detail.deleteCarTitle()}
        description={
          deleteCarTarget
            ? LL.internalPanel.companies.detail.deleteCarDescription({
                licensePlate: deleteCarTarget.licensePlate,
              })
            : ''
        }
        confirmLabel={LL.internalPanel.companies.deleteConfirm()}
        cancelLabel={LL.internalPanel.nav.cancel()}
        confirmVariant="danger"
        loading={deleteCarMutation.isPending}
        loadingLabel={LL.internalPanel.companies.deleting()}
        onConfirm={async function confirmDeleteCar() {
          if (deleteCarTarget) {
            await deleteCarMutation.mutateAsync(deleteCarTarget.id)
          }
        }}
        onCancel={function cancelDeleteCar() {
          if (!deleteCarMutation.isPending) {
            setDeleteCarTarget(null)
          }
        }}
      />
    </>
  )
}
