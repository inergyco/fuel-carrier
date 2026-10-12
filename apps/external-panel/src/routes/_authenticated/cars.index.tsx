import { createFileRoute } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { Car } from '@fuel-carrier/shared-types'
import { isCompanyUserAdmin } from '@fuel-carrier/shared-types'
import { api } from '@fuel-carrier/web-ui/api'
import { useCarTelemetryLive } from '@fuel-carrier/web-ui/map'
import { Plus } from '@fuel-carrier/web-ui/icons'
import {
  Button,
  DashboardCardsSkeleton,
  ICON_STROKE_WIDTH,
  iconMdClassName,
  Pagination,
  parseResourceListSearch,
  QueryErrorState,
  ResourceListToolbar,
} from '@fuel-carrier/web-ui/ui'
import { CarFormModal } from '../../components/cars/CarFormModal'
import { CarCustodyActions } from '../../components/cars/CarCustodyActions'
import { CarCustodyPickerSession } from '../../components/cars/CarCustodyPickerSession'
import { CarMqttCredentialsModals } from '../../components/cars/CarMqttCredentialsModals'
import { CarsCardList } from '../../components/cars/CarsCardList'
import { DeleteCarModal } from '../../components/cars/DeleteCarModal'
import { useCarCustody } from '../../components/cars/useCarCustody'
import { useCarMqttCredentials } from '../../components/cars/useCarMqttCredentials'
import { CARS_PAGE_SIZE, useCars } from '../../components/cars/useCars'

export const Route = createFileRoute('/_authenticated/cars/')({
  validateSearch: parseResourceListSearch,
  component: CarsPage,
})

function CarsPage() {
  const { LL } = useI18nContext()
  const { user } = Route.useRouteContext()
  const canManage = isCompanyUserAdmin(user)
  const cars = useCars()
  const mqtt = useCarMqttCredentials()
  const custody = useCarCustody()
  const telemetryQuery = useCarTelemetryLive(api)
  const result = cars.carsQuery.data
  const isLoading =
    (cars.carsQuery.isLoading && !result) || cars.driversQuery.isLoading
  const telemetryByCarId = new Map(
    (telemetryQuery.data ?? []).map((marker) => [marker.carId, marker]),
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
          label={LL.externalPanel.cars.loading()}
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

    if (cars.items.length === 0) {
      return (
        <p className="text-sm text-base-content/50">
          {cars.hasActiveFilters
            ? LL.externalPanel.cars.emptyFiltered()
            : LL.externalPanel.cars.empty()}
        </p>
      )
    }

    return (
      <>
        <CarsCardList
          cars={cars.items}
          telemetryByCarId={telemetryByCarId}
          actionLabels={{
            loading: LL.externalPanel.cars.loading(),
            edit: LL.externalPanel.cars.edit(),
            delete: LL.externalPanel.cars.delete(),
            operations: LL.externalPanel.cars.operations(),
            mqttCredentials: LL.externalPanel.cars.mqttCredentialsAction(),
          }}
          onEdit={function openEditCar(car) {
            cars.setCarModal({ mode: 'edit', item: car })
          }}
          onDelete={cars.setDeleteTarget}
          onMqttCredentials={canManage ? mqtt.openMqttCredentials : undefined}
          renderExtraActions={canManage ? renderCustodyAction : undefined}
          readOnly={!canManage}
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
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <ResourceListToolbar
            searchPlaceholder={LL.externalPanel.cars.searchPlaceholder()}
            searchText={cars.draftSearchText}
            onSearchTextChange={cars.setDraftSearchText}
            fuelGrade={cars.fuelGrade}
            onFuelGradeChange={cars.setFuelGrade}
            fuelLevel={cars.fuelLevel}
            onFuelLevelChange={cars.setFuelLevel}
          />
        </div>
        {canManage ? (
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
              {LL.externalPanel.cars.addCar()}
            </span>
          </Button>
        ) : null}
      </div>

      {renderCars()}

      {canManage && cars.carModal ? (
        <CarFormModal
          key={
            cars.carModal.mode === 'edit'
              ? `car-edit-${cars.carModal.item.id}`
              : 'car-create'
          }
          mode={cars.carModal.mode}
          car={cars.carModal.mode === 'edit' ? cars.carModal.item : undefined}
          drivers={cars.driversQuery.data ?? []}
          onClose={function closeCarModal() {
            cars.setCarModal(null)
          }}
          onSuccess={cars.handleChanged}
        />
      ) : null}

      {canManage ? (
        <DeleteCarModal
          target={cars.deleteTarget}
          mutation={cars.deleteMutation}
          onClose={function closeDeleteModal() {
            cars.setDeleteTarget(null)
          }}
        />
      ) : null}

      {canManage ? (
        <CarMqttCredentialsModals
          target={mqtt.mqttTarget}
          credentials={mqtt.mqttCredentials}
          mutation={mqtt.mqttMutation}
          onCloseConfirm={mqtt.closeMqttConfirm}
          onCloseCredentials={mqtt.closeMqttCredentials}
        />
      ) : null}

      {canManage && custody.target ? (
        <CarCustodyPickerSession
          key={`${custody.target.car.id}-${custody.target.mode}`}
          car={custody.target.car}
          mode={custody.target.mode}
          custody={custody}
        />
      ) : null}
    </div>
  )
}
