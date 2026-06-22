import type { Car, CompanyUser, Driver } from '@fuel-carrier/shared-types'
import { CarFormModal } from './CarFormModal'
import { CompanyUserFormModal } from './CompanyUserFormModal'
import { DriverFormModal } from './DriverFormModal'
import type { EntityModalState } from './useCompanyDetailResources'

interface CompanyDetailFormModalsProps {
  companyId: string
  companyDrivers: Driver[]
  userModal: EntityModalState<CompanyUser>
  setUserModal: (state: EntityModalState<CompanyUser>) => void
  driverModal: EntityModalState<Driver>
  setDriverModal: (state: EntityModalState<Driver>) => void
  carModal: EntityModalState<Car>
  setCarModal: (state: EntityModalState<Car>) => void
  onUsersChanged: () => void | Promise<void>
  onDriversChanged: () => void | Promise<void>
  onCarsChanged: () => void | Promise<void>
}

export function CompanyDetailFormModals({
  companyId,
  companyDrivers,
  userModal,
  setUserModal,
  driverModal,
  setDriverModal,
  carModal,
  setCarModal,
  onUsersChanged,
  onDriversChanged,
  onCarsChanged,
}: CompanyDetailFormModalsProps) {
  return (
    <>
      {userModal && (
        <CompanyUserFormModal
          key={
            userModal.mode === 'edit'
              ? `user-edit-${userModal.item.id}`
              : 'user-create'
          }
          mode={userModal.mode}
          companyId={companyId}
          user={userModal.mode === 'edit' ? userModal.item : undefined}
          onClose={function closeUserModal() {
            setUserModal(null)
          }}
          onSuccess={onUsersChanged}
        />
      )}

      {driverModal && (
        <DriverFormModal
          key={
            driverModal.mode === 'edit'
              ? `driver-edit-${driverModal.item.id}`
              : 'driver-create'
          }
          mode={driverModal.mode}
          companyId={companyId}
          driver={driverModal.mode === 'edit' ? driverModal.item : undefined}
          onClose={function closeDriverModal() {
            setDriverModal(null)
          }}
          onSuccess={onDriversChanged}
        />
      )}

      {carModal && (
        <CarFormModal
          key={
            carModal.mode === 'edit' ? `car-edit-${carModal.item.id}` : 'car-create'
          }
          mode={carModal.mode}
          companyId={companyId}
          drivers={companyDrivers}
          car={carModal.mode === 'edit' ? carModal.item : undefined}
          onClose={function closeCarModal() {
            setCarModal(null)
          }}
          onSuccess={onCarsChanged}
        />
      )}
    </>
  )
}
