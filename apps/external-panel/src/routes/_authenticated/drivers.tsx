import { createFileRoute } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { isCompanyUserAdmin } from '@fuel-carrier/shared-types'
import { DeleteDriverModal } from '../../components/drivers/DeleteDriverModal'
import { DriverFormModal } from '../../components/drivers/DriverFormModal'
import { getDriverColumns } from '../../components/drivers/driverColumns'
import { useDrivers } from '../../components/drivers/useDrivers'
import { ResourceSection } from '../../components/users/ResourceSection'

export const Route = createFileRoute('/_authenticated/drivers')({
  component: DriversPage,
})

function DriversPage() {
  const { LL } = useI18nContext()
  const { user } = Route.useRouteContext()
  const canManage = isCompanyUserAdmin(user)
  const drivers = useDrivers()
  const emptyCell = LL.externalPanel.drivers.emptyCell()

  return (
    <div className="mx-auto max-w-5xl">
      <ResourceSection
        title={LL.externalPanel.drivers.title()}
        subtitle={LL.externalPanel.drivers.subtitle()}
        addLabel={LL.externalPanel.drivers.addDriver()}
        emptyLabel={LL.externalPanel.drivers.empty()}
        loading={drivers.driversQuery.isLoading}
        items={drivers.driversQuery.data ?? []}
        columns={getDriverColumns({ LL, emptyCell })}
        actionLabels={{
          loading: LL.externalPanel.drivers.loading(),
          edit: LL.externalPanel.drivers.edit(),
          delete: LL.externalPanel.drivers.delete(),
          operations: LL.externalPanel.drivers.operations(),
        }}
        onAdd={function openCreateDriver() {
          drivers.setDriverModal({ mode: 'create' })
        }}
        onEdit={function openEditDriver(driver) {
          drivers.setDriverModal({ mode: 'edit', item: driver })
        }}
        onDelete={drivers.setDeleteTarget}
        readOnly={!canManage}
      />

      {canManage && drivers.driverModal ? (
        <DriverFormModal
          key={
            drivers.driverModal.mode === 'edit'
              ? `driver-edit-${drivers.driverModal.item.id}`
              : 'driver-create'
          }
          mode={drivers.driverModal.mode}
          driver={
            drivers.driverModal.mode === 'edit'
              ? drivers.driverModal.item
              : undefined
          }
          onClose={function closeDriverModal() {
            drivers.setDriverModal(null)
          }}
          onSuccess={drivers.handleChanged}
        />
      ) : null}

      {canManage ? (
        <DeleteDriverModal
          target={drivers.deleteTarget}
          mutation={drivers.deleteMutation}
          onClose={function closeDeleteModal() {
            drivers.setDeleteTarget(null)
          }}
        />
      ) : null}
    </div>
  )
}
