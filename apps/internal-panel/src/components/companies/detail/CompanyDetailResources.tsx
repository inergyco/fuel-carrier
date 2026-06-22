import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  getCarColumns,
  getDriverColumns,
  getUserColumns,
} from './companyResourceColumns'
import { CompanyDetailDeleteModals } from './CompanyDetailDeleteModals'
import { CompanyDetailFormModals } from './CompanyDetailFormModals'
import { ResourceSection } from './ResourceSection'
import { useCompanyDetailResources } from './useCompanyDetailResources'

interface CompanyDetailResourcesProps {
  companyId: string
}

export function CompanyDetailResources({ companyId }: CompanyDetailResourcesProps) {
  const { LL } = useI18nContext()
  const resources = useCompanyDetailResources(companyId)
  const emptyCell = LL.internalPanel.companies.emptyCell()

  return (
    <div className="mt-8 flex flex-col gap-6">
      <ResourceSection
        title={LL.internalPanel.companies.detail.usersTitle()}
        subtitle={LL.internalPanel.companies.detail.usersSubtitle()}
        addLabel={LL.internalPanel.companies.detail.addUser()}
        emptyLabel={LL.internalPanel.companies.detail.usersEmpty()}
        loading={resources.usersQuery.isLoading}
        items={resources.usersQuery.data ?? []}
        columns={getUserColumns({ LL, emptyCell })}
        onAdd={function openCreateUser() {
          resources.setUserModal({ mode: 'create' })
        }}
        onEdit={function openEditUser(user) {
          resources.setUserModal({ mode: 'edit', item: user })
        }}
        onDelete={resources.setDeleteUserTarget}
      />

      <ResourceSection
        title={LL.internalPanel.companies.detail.driversTitle()}
        subtitle={LL.internalPanel.companies.detail.driversSubtitle()}
        addLabel={LL.internalPanel.companies.detail.addDriver()}
        emptyLabel={LL.internalPanel.companies.detail.driversEmpty()}
        loading={resources.driversQuery.isLoading}
        items={resources.companyDrivers}
        columns={getDriverColumns({ LL, emptyCell })}
        onAdd={function openCreateDriver() {
          resources.setDriverModal({ mode: 'create' })
        }}
        onEdit={function openEditDriver(driver) {
          resources.setDriverModal({ mode: 'edit', item: driver })
        }}
        onDelete={resources.setDeleteDriverTarget}
      />

      <ResourceSection
        title={LL.internalPanel.companies.detail.carsTitle()}
        subtitle={LL.internalPanel.companies.detail.carsSubtitle()}
        addLabel={LL.internalPanel.companies.detail.addCar()}
        emptyLabel={LL.internalPanel.companies.detail.carsEmpty()}
        loading={resources.carsQuery.isLoading}
        items={resources.companyCars}
        columns={getCarColumns({
          LL,
          emptyCell,
          driverNameById: resources.driverNameById,
        })}
        onAdd={function openCreateCar() {
          resources.setCarModal({ mode: 'create' })
        }}
        onEdit={function openEditCar(car) {
          resources.setCarModal({ mode: 'edit', item: car })
        }}
        onDelete={resources.setDeleteCarTarget}
      />

      <CompanyDetailFormModals
        companyId={companyId}
        companyDrivers={resources.companyDrivers}
        userModal={resources.userModal}
        setUserModal={resources.setUserModal}
        driverModal={resources.driverModal}
        setDriverModal={resources.setDriverModal}
        carModal={resources.carModal}
        setCarModal={resources.setCarModal}
        onUsersChanged={resources.handleUsersChanged}
        onDriversChanged={resources.handleDriversChanged}
        onCarsChanged={resources.handleCarsChanged}
      />

      <CompanyDetailDeleteModals
        deleteUserTarget={resources.deleteUserTarget}
        setDeleteUserTarget={resources.setDeleteUserTarget}
        deleteDriverTarget={resources.deleteDriverTarget}
        setDeleteDriverTarget={resources.setDeleteDriverTarget}
        deleteCarTarget={resources.deleteCarTarget}
        setDeleteCarTarget={resources.setDeleteCarTarget}
        deleteUserMutation={resources.deleteUserMutation}
        deleteDriverMutation={resources.deleteDriverMutation}
        deleteCarMutation={resources.deleteCarMutation}
      />
    </div>
  )
}
