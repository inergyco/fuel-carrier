import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Pagination } from '@fuel-carrier/web-ui/ui'
import { getDriverColumns } from './companyResourceColumns'
import { DeleteCompanyDriverModal } from './DeleteCompanyDriverModal'
import { DriverFormModal } from './DriverFormModal'
import { ResourceSection } from './ResourceSection'
import { useCompanyDrivers } from './useCompanyDrivers'

interface CompanyDriversSectionProps {
  companyId: string
}

export function CompanyDriversSection({ companyId }: CompanyDriversSectionProps) {
  const { LL } = useI18nContext()
  const drivers = useCompanyDrivers(companyId)
  const result = drivers.driversQuery.data

  return (
    <>
      <ResourceSection
        title={LL.internalPanel.companies.detail.driversTitle()}
        subtitle={LL.internalPanel.companies.detail.driversSubtitle()}
        addLabel={LL.internalPanel.companies.detail.addDriver()}
        emptyLabel={LL.internalPanel.companies.detail.driversEmpty()}
        loading={drivers.driversQuery.isLoading && !result}
        items={drivers.companyDrivers}
        columns={getDriverColumns({ LL })}
        onAdd={function openCreateDriver() {
          drivers.setDriverModal({ mode: 'create' })
        }}
        onEdit={function openEditDriver(driver) {
          drivers.setDriverModal({ mode: 'edit', item: driver })
        }}
        onDelete={drivers.setDeleteTarget}
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

      {drivers.driverModal && (
        <DriverFormModal
          key={
            drivers.driverModal.mode === 'edit'
              ? `driver-edit-${drivers.driverModal.item.id}`
              : 'driver-create'
          }
          mode={drivers.driverModal.mode}
          companyId={companyId}
          driver={
            drivers.driverModal.mode === 'edit' ? drivers.driverModal.item : undefined
          }
          onClose={function closeDriverModal() {
            drivers.setDriverModal(null)
          }}
          onSuccess={drivers.handleChanged}
        />
      )}

      <DeleteCompanyDriverModal
        target={drivers.deleteTarget}
        mutation={drivers.deleteMutation}
        onClose={function closeDeleteModal() {
          drivers.setDeleteTarget(null)
        }}
      />
    </>
  )
}
