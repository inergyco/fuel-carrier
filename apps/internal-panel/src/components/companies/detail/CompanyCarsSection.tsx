import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { Car } from '@fuel-carrier/shared-types'
import { api } from '@fuel-carrier/web-ui/api'
import { Plus } from '@fuel-carrier/web-ui/icons'
import { useCarTelemetryLive } from '@fuel-carrier/web-ui/map'
import {
  Button,
  DashboardCardsSkeleton,
  ICON_STROKE_WIDTH,
  iconMdClassName,
  Pagination,
  QueryErrorState,
  ResourceListToolbar,
} from '@fuel-carrier/web-ui/ui'
import { CompanyCarsCardList } from './CompanyCarsCardList'
import { CarFormModal } from './CarFormModal'
import { CarMqttCredentialsModals } from './CarMqttCredentialsModals'
import { CarCustodyActions } from './custody/CarCustodyActions'
import { CarCustodyModals } from './custody/CarCustodyModals'
import { useCompanyCarCustody } from './custody/useCompanyCarCustody'
import { DeleteCompanyCarModal } from './DeleteCompanyCarModal'
import { CARS_PAGE_SIZE, useCompanyCars } from './useCompanyCars'

interface CompanyCarsSectionProps {
  companyId: string
}

export function CompanyCarsSection({ companyId }: CompanyCarsSectionProps) {
  const { LL } = useI18nContext()
  const cars = useCompanyCars(companyId)
  const custody = useCompanyCarCustody(companyId)
  const telemetryQuery = useCarTelemetryLive(api)
  const result = cars.carsQuery.data
  const isLoading = cars.carsQuery.isLoading && !result
  const detail = LL.internalPanel.companies.detail
  const telemetryByCarId = new Map(
    (telemetryQuery.data ?? [])
      .filter((marker) => marker.companyId === companyId)
      .map((marker) => [marker.carId, marker]),
  )

  function renderCustodyAction(car: Car) {
    return <CarCustodyActions car={car} custody={custody} layout="compact" />
  }

  function openCreateCar() {
    cars.setCarModal({ mode: 'create' })
  }

  function renderCars() {
    if (isLoading) {
      return (
        <DashboardCardsSkeleton
          label={LL.internalPanel.companies.loading()}
          variant="car"
          count={CARS_PAGE_SIZE}
          showToolbarSkeleton={false}
          showCardActions
          showPagination
          columnsClassName="grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        />
      )
    }

    if (cars.carsQuery.isError) {
      return (
        <QueryErrorState
          onRetry={() => {
            void cars.carsQuery.refetch()
          }}
          labels={{
            loadFailed: LL.common.queryError.loadFailed(),
            retry: LL.common.queryError.retry(),
          }}
        />
      )
    }

    if (cars.companyCars.length === 0) {
      return (
        <p className="text-sm text-base-content/50">
          {cars.hasActiveFilters
            ? detail.carsEmptyFiltered()
            : detail.carsEmpty()}
        </p>
      )
    }

    return (
      <>
        <CompanyCarsCardList
          companyId={companyId}
          cars={cars.companyCars}
          telemetryByCarId={telemetryByCarId}
          onEdit={function openEditCar(car) {
            cars.setCarModal({ mode: 'edit', item: car })
          }}
          onDelete={cars.setDeleteTarget}
          onMqttCredentials={cars.openMqttCredentials}
          renderExtraActions={renderCustodyAction}
        />
        {result ? (
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            totalItems={result.totalItems}
            limit={result.limit}
            onPageChange={cars.handlePageChange}
            showLimitSelect={false}
            labels={LL.common.pagination}
          />
        ) : null}
      </>
    )
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <ResourceListToolbar
            searchPlaceholder={detail.carsSearchPlaceholder()}
            searchText={cars.draftSearchText}
            onSearchTextChange={cars.setDraftSearchText}
            fuelGrade={cars.fuelGrade}
            onFuelGradeChange={cars.setFuelGrade}
            fuelLevel={cars.fuelLevel}
            onFuelLevelChange={cars.setFuelLevel}
          />
        </div>
        <Button
          type="button"
          className="h-11 w-full shrink-0 sm:w-auto sm:self-start sm:px-5 lg:self-auto"
          onClick={openCreateCar}
        >
          <span className="flex items-center justify-center gap-2">
            <Plus
              className={iconMdClassName}
              strokeWidth={ICON_STROKE_WIDTH}
              aria-hidden
            />
            {detail.addCar()}
          </span>
        </Button>
      </div>

      {renderCars()}

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
