import { useI18nContext } from '@fuel-carrier/i18n/react'
import { getCarColumns } from './companyResourceColumns'
import { CarFormModal } from './CarFormModal'
import { DeleteCompanyCarModal } from './DeleteCompanyCarModal'
import { ResourceSection } from './ResourceSection'
import { useCompanyCars } from './useCompanyCars'

interface CompanyCarsSectionProps {
  companyId: string
}

export function CompanyCarsSection({ companyId }: CompanyCarsSectionProps) {
  const { LL } = useI18nContext()
  const cars = useCompanyCars(companyId)
  const emptyCell = LL.internalPanel.companies.emptyCell()

  return (
    <>
      <ResourceSection
        title={LL.internalPanel.companies.detail.carsTitle()}
        subtitle={LL.internalPanel.companies.detail.carsSubtitle()}
        addLabel={LL.internalPanel.companies.detail.addCar()}
        emptyLabel={LL.internalPanel.companies.detail.carsEmpty()}
        loading={cars.carsQuery.isLoading}
        items={cars.companyCars}
        columns={getCarColumns({
          LL,
          emptyCell,
          driverNameById: cars.driverNameById,
        })}
        onAdd={function openCreateCar() {
          cars.setCarModal({ mode: 'create' })
        }}
        onEdit={function openEditCar(car) {
          cars.setCarModal({ mode: 'edit', item: car })
        }}
        onDelete={cars.setDeleteTarget}
      />

      {cars.carModal && (
        <CarFormModal
          key={
            cars.carModal.mode === 'edit'
              ? `car-edit-${cars.carModal.item.id}`
              : 'car-create'
          }
          mode={cars.carModal.mode}
          companyId={companyId}
          drivers={cars.companyDrivers}
          car={cars.carModal.mode === 'edit' ? cars.carModal.item : undefined}
          onClose={function closeCarModal() {
            cars.setCarModal(null)
          }}
          onSuccess={cars.handleChanged}
        />
      )}

      <DeleteCompanyCarModal
        target={cars.deleteTarget}
        mutation={cars.deleteMutation}
        onClose={function closeDeleteModal() {
          cars.setDeleteTarget(null)
        }}
      />
    </>
  )
}
