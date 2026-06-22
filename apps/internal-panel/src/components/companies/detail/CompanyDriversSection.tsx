import { useI18nContext } from '@fuel-carrier/i18n/react'
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

  return (
    <>
      <ResourceSection
        title={LL.internalPanel.companies.detail.driversTitle()}
        subtitle={LL.internalPanel.companies.detail.driversSubtitle()}
        addLabel={LL.internalPanel.companies.detail.addDriver()}
        emptyLabel={LL.internalPanel.companies.detail.driversEmpty()}
        loading={drivers.driversQuery.isLoading}
        items={drivers.companyDrivers}
        columns={getDriverColumns({ LL })}
        onAdd={function openCreateDriver() {
          drivers.setDriverModal({ mode: 'create' })
        }}
        onEdit={function openEditDriver(driver) {
          drivers.setDriverModal({ mode: 'edit', item: driver })
        }}
        onDelete={drivers.setDeleteTarget}
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
