import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Link } from '@tanstack/react-router'
import {
  dataTableViewActionClassName,
  ICON_STROKE_WIDTH,
  iconSmClassName,
  Pagination,
  ResourceListToolbar,
} from '@fuel-carrier/web-ui/ui'
import { Eye } from '@fuel-carrier/web-ui/icons'
import type { Car } from '@fuel-carrier/shared-types'
import { getCarColumns } from './companyResourceColumns'
import { CarFormModal } from './CarFormModal'
import { CarMqttCredentialsModals } from './CarMqttCredentialsModals'
import { CarCustodyActions } from './custody/CarCustodyActions'
import { CarCustodyModals } from './custody/CarCustodyModals'
import { useCompanyCarCustody } from './custody/useCompanyCarCustody'
import { DeleteCompanyCarModal } from './DeleteCompanyCarModal'
import { ResourceSection } from './ResourceSection'
import { useCompanyCars } from './useCompanyCars'

interface CompanyCarsSectionProps {
  companyId: string
}

export function CompanyCarsSection({ companyId }: CompanyCarsSectionProps) {
  const { LL } = useI18nContext()
  const cars = useCompanyCars(companyId)
  const custody = useCompanyCarCustody(companyId)
  const emptyCell = LL.internalPanel.companies.emptyCell()
  const result = cars.carsQuery.data

  function renderCustodyAction(car: Car) {
    return <CarCustodyActions car={car} custody={custody} layout="compact" />
  }

  return (
    <>
      <ResourceSection
        title={LL.internalPanel.companies.detail.carsTitle()}
        subtitle={LL.internalPanel.companies.detail.carsSubtitle()}
        addLabel={LL.internalPanel.companies.detail.addCar()}
        emptyLabel={
          cars.hasActiveFilters
            ? LL.internalPanel.companies.detail.carsEmptyFiltered()
            : LL.internalPanel.companies.detail.carsEmpty()
        }
        loading={cars.carsQuery.isLoading && !result}
        isError={cars.carsQuery.isError}
        onRetry={() => {
          void cars.carsQuery.refetch()
        }}
        errorLabels={{
          loadFailed: LL.common.queryError.loadFailed(),
          retry: LL.common.queryError.retry(),
        }}
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
        renderExtraActions={renderCustodyAction}
        toolbar={
          <ResourceListToolbar
            searchPlaceholder={LL.internalPanel.companies.detail.carsSearchPlaceholder()}
            searchText={cars.draftSearchText}
            onSearchTextChange={cars.setDraftSearchText}
            assignment={cars.assignment}
            onAssignmentChange={cars.setAssignment}
          />
        }
        footer={
          result ? (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              totalItems={result.totalItems}
              limit={result.limit}
              onPageChange={cars.handlePageChange}
              onLimitChange={cars.handleLimitChange}
              labels={LL.common.pagination}
            />
          ) : null
        }
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

      <CarCustodyModals custody={custody} />
    </>
  )
}
