import { createFileRoute } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { isCompanyUserAdmin } from '@fuel-carrier/shared-types'
import { Pagination, parseResourceListSearch } from '@fuel-carrier/web-ui/ui'
import { DeleteDriverModal } from '../../components/drivers/DeleteDriverModal'
import { DriverFormModal } from '../../components/drivers/DriverFormModal'
import { getDriverColumns } from '../../components/drivers/driverColumns'
import { useDrivers } from '../../components/drivers/useDrivers'
import { ResourceListToolbar } from '../../components/users/ResourceListToolbar'
import { ResourceSection } from '../../components/users/ResourceSection'

export const Route = createFileRoute('/_authenticated/drivers')({
  validateSearch: parseResourceListSearch,
  component: DriversPage,
})

function DriversPage() {
  const { LL } = useI18nContext()
  const { user } = Route.useRouteContext()
  const canManage = isCompanyUserAdmin(user)
  const drivers = useDrivers()
  const emptyCell = LL.externalPanel.drivers.emptyCell()
  const result = drivers.driversQuery.data

  return (
    <div>
      <ResourceSection
        title={LL.externalPanel.drivers.title()}
        subtitle={LL.externalPanel.drivers.subtitle()}
        addLabel={LL.externalPanel.drivers.addDriver()}
        emptyLabel={
          drivers.hasActiveFilters
            ? LL.externalPanel.drivers.emptyFiltered()
            : LL.externalPanel.drivers.empty()
        }
        loading={drivers.driversQuery.isLoading && !result}
        items={drivers.items}
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
        toolbar={
          <ResourceListToolbar
            searchPlaceholder={LL.externalPanel.drivers.searchPlaceholder()}
            searchText={drivers.draftSearchText}
            onSearchTextChange={drivers.setDraftSearchText}
            assignment={drivers.assignment}
            onAssignmentChange={drivers.setAssignment}
          />
        }
        footer={
          result ? (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              totalItems={result.totalItems}
              limit={result.limit}
              onPageChange={drivers.handlePageChange}
              onLimitChange={drivers.handleLimitChange}
              labels={LL.common.pagination}
            />
          ) : null
        }
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
