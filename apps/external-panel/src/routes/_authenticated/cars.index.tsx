import { createFileRoute } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { Car } from '@fuel-carrier/shared-types'
import { isCompanyUserAdmin } from '@fuel-carrier/shared-types'
import { CarFormModal } from '../../components/cars/CarFormModal'
import { CarViewAction } from '../../components/cars/CarViewAction'
import { getCarColumns } from '../../components/cars/carColumns'
import { DeleteCarModal } from '../../components/cars/DeleteCarModal'
import { useCars } from '../../components/cars/useCars'
import { ResourceSection } from '../../components/users/ResourceSection'

export const Route = createFileRoute('/_authenticated/cars/')({
  component: CarsPage,
})

function CarsPage() {
  const { LL } = useI18nContext()
  const { user } = Route.useRouteContext()
  const canManage = isCompanyUserAdmin(user)
  const cars = useCars()
  const emptyCell = LL.externalPanel.cars.emptyCell()
  const isLoading = cars.carsQuery.isLoading || cars.driversQuery.isLoading

  function renderViewAction(car: Car) {
    return <CarViewAction car={car} />
  }

  return (
    <div className="mx-auto max-w-5xl">
      <ResourceSection
        title={LL.externalPanel.cars.title()}
        subtitle={LL.externalPanel.cars.subtitle()}
        addLabel={LL.externalPanel.cars.addCar()}
        emptyLabel={LL.externalPanel.cars.empty()}
        loading={isLoading}
        items={cars.carsQuery.data ?? []}
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
        }}
        onAdd={function openCreateCar() {
          cars.setCarModal({ mode: 'create' })
        }}
        onEdit={function openEditCar(car) {
          cars.setCarModal({ mode: 'edit', item: car })
        }}
        onDelete={cars.setDeleteTarget}
        renderViewAction={renderViewAction}
        readOnly={!canManage}
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
    </div>
  )
}
