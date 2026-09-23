import { createFileRoute } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { Car } from '@fuel-carrier/shared-types'
import { isCompanyUserAdmin } from '@fuel-carrier/shared-types'
import {
  Pagination,
  parseResourceListSearch,
  ResourceListToolbar,
} from '@fuel-carrier/web-ui/ui'
import { CarFormModal } from '../../components/cars/CarFormModal'
import { CarCustodyActions } from '../../components/cars/CarCustodyActions'
import { CarCustodyModals } from '../../components/cars/CarCustodyModals'
import { CarMqttCredentialsModals } from '../../components/cars/CarMqttCredentialsModals'
import { CarViewAction } from '../../components/cars/CarViewAction'
import { getCarColumns } from '../../components/cars/carColumns'
import { DeleteCarModal } from '../../components/cars/DeleteCarModal'
import { useCarCustody } from '../../components/cars/useCarCustody'
import { useCarMqttCredentials } from '../../components/cars/useCarMqttCredentials'
import { useCars } from '../../components/cars/useCars'
import { ResourceSection } from '../../components/users/ResourceSection'

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
  const emptyCell = LL.externalPanel.cars.emptyCell()
  const result = cars.carsQuery.data
  const isLoading =
    (cars.carsQuery.isLoading && !result) || cars.driversQuery.isLoading

  function renderViewAction(car: Car) {
    return <CarViewAction car={car} />
  }

  function renderCustodyAction(car: Car) {
    return <CarCustodyActions car={car} custody={custody} layout="compact" />
  }

  return (
    <div>
      <ResourceSection
        title={LL.externalPanel.cars.title()}
        subtitle={LL.externalPanel.cars.subtitle()}
        addLabel={LL.externalPanel.cars.addCar()}
        emptyLabel={
          cars.hasActiveFilters
            ? LL.externalPanel.cars.emptyFiltered()
            : LL.externalPanel.cars.empty()
        }
        loading={isLoading}
        isError={cars.carsQuery.isError}
        onRetry={() => {
          void cars.carsQuery.refetch()
        }}
        errorLabels={{
          loadFailed: LL.common.queryError.loadFailed(),
          retry: LL.common.queryError.retry(),
        }}
        items={cars.items}
        columns={getCarColumns({
          LL,
          emptyCell,
          driverNameById: cars.driverNameById,
        })}
        actionLabels={{
          loading: LL.externalPanel.cars.loading(),
          edit: LL.externalPanel.cars.edit(),
          delete: LL.externalPanel.cars.delete(),
          operations: LL.externalPanel.cars.operations(),
          mqttCredentials: LL.externalPanel.cars.mqttCredentialsAction(),
        }}
        onAdd={function openCreateCar() {
          cars.setCarModal({ mode: 'create' })
        }}
        onEdit={function openEditCar(car) {
          cars.setCarModal({ mode: 'edit', item: car })
        }}
        onDelete={cars.setDeleteTarget}
        onMqttCredentials={canManage ? mqtt.openMqttCredentials : undefined}
        renderViewAction={renderViewAction}
        renderExtraActions={canManage ? renderCustodyAction : undefined}
        readOnly={!canManage}
        toolbar={
          <ResourceListToolbar
            searchPlaceholder={LL.externalPanel.cars.searchPlaceholder()}
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

      {canManage ? <CarCustodyModals custody={custody} /> : null}
    </div>
  )
}
