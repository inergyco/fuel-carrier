import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Link } from '@tanstack/react-router'
import {
  dataTableViewActionClassName,
  ICON_STROKE_WIDTH,
  iconSmClassName,
} from '@fuel-carrier/web-ui/ui'
import { Eye } from '@fuel-carrier/web-ui/icons'
import type { Car } from '@fuel-carrier/shared-types'
import { getCarColumns } from './companyResourceColumns'
import { CarFormModal } from './CarFormModal'
import { CarMqttCredentialsModals } from './CarMqttCredentialsModals'
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
        onMqttCredentials={cars.openMqttCredentials}
        renderView={function renderCarView(car: Car) {
          return (
            <Link
              to="/companies/$companyId/cars/$carId"
              params={{ companyId, carId: car.id }}
              className={dataTableViewActionClassName()}
              aria-label={LL.internalPanel.companies.detail.viewCar()}
            >
              <Eye
                className={iconSmClassName}
                strokeWidth={ICON_STROKE_WIDTH}
                aria-hidden
              />
            </Link>
          )
        }}
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

      <CarMqttCredentialsModals
        target={cars.mqttTarget}
        credentials={cars.mqttCredentials}
        mutation={cars.mqttMutation}
        onCloseConfirm={cars.closeMqttConfirm}
        onCloseCredentials={cars.closeMqttCredentials}
      />
    </>
  )
}
