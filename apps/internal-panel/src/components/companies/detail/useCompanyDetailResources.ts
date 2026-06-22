import { useMemo, useState } from 'react'
import type { Car, CompanyUser, Driver } from '@fuel-carrier/shared-types'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { carKeys, deleteCar, fetchCars } from '../../../lib/api/cars'
import {
  companyUserKeys,
  deleteCompanyUser,
  fetchCompanyUsers,
} from '../../../lib/api/company-users'
import { deleteDriver, driverKeys, fetchDrivers } from '../../../lib/api/drivers'

export type EntityModalState<T> =
  | { mode: 'create' }
  | { mode: 'edit'; item: T }
  | null

export function useCompanyDetailResources(companyId: string) {
  const queryClient = useQueryClient()

  const [userModal, setUserModal] = useState<EntityModalState<CompanyUser>>(null)
  const [driverModal, setDriverModal] = useState<EntityModalState<Driver>>(null)
  const [carModal, setCarModal] = useState<EntityModalState<Car>>(null)
  const [deleteUserTarget, setDeleteUserTarget] = useState<CompanyUser | null>(null)
  const [deleteDriverTarget, setDeleteDriverTarget] = useState<Driver | null>(null)
  const [deleteCarTarget, setDeleteCarTarget] = useState<Car | null>(null)

  const usersQuery = useQuery({
    queryKey: companyUserKeys.byCompany(companyId),
    queryFn: function loadUsers() {
      return fetchCompanyUsers(companyId)
    },
  })

  const driversQuery = useQuery({
    queryKey: driverKeys.all,
    queryFn: fetchDrivers,
  })

  const carsQuery = useQuery({
    queryKey: carKeys.all,
    queryFn: fetchCars,
  })

  const companyDrivers = useMemo(
    function filterCompanyDrivers() {
      return (driversQuery.data ?? []).filter(
        (driver) => driver.companyId === companyId,
      )
    },
    [driversQuery.data, companyId],
  )

  const companyCars = useMemo(
    function filterCompanyCars() {
      return (carsQuery.data ?? []).filter((car) => car.companyId === companyId)
    },
    [carsQuery.data, companyId],
  )

  const driverNameById = useMemo(
    function mapDriverNames() {
      return new Map(
        companyDrivers.map((driver) => [
          driver.id,
          `${driver.firstName} ${driver.lastName}`,
        ]),
      )
    },
    [companyDrivers],
  )

  const deleteUserMutation = useMutation({
    mutationFn: deleteCompanyUser,
    onSuccess: async function onUserDeleted() {
      await queryClient.invalidateQueries({
        queryKey: companyUserKeys.byCompany(companyId),
      })
      setDeleteUserTarget(null)
    },
  })

  const deleteDriverMutation = useMutation({
    mutationFn: deleteDriver,
    onSuccess: async function onDriverDeleted() {
      await queryClient.invalidateQueries({ queryKey: driverKeys.all })
      await queryClient.invalidateQueries({ queryKey: carKeys.all })
      setDeleteDriverTarget(null)
    },
  })

  const deleteCarMutation = useMutation({
    mutationFn: deleteCar,
    onSuccess: async function onCarDeleted() {
      await queryClient.invalidateQueries({ queryKey: carKeys.all })
      setDeleteCarTarget(null)
    },
  })

  async function handleUsersChanged() {
    await queryClient.invalidateQueries({
      queryKey: companyUserKeys.byCompany(companyId),
    })
  }

  async function handleDriversChanged() {
    await queryClient.invalidateQueries({ queryKey: driverKeys.all })
  }

  async function handleCarsChanged() {
    await queryClient.invalidateQueries({ queryKey: carKeys.all })
  }

  return {
    usersQuery,
    driversQuery,
    carsQuery,
    companyDrivers,
    companyCars,
    driverNameById,
    userModal,
    setUserModal,
    driverModal,
    setDriverModal,
    carModal,
    setCarModal,
    deleteUserTarget,
    setDeleteUserTarget,
    deleteDriverTarget,
    setDeleteDriverTarget,
    deleteCarTarget,
    setDeleteCarTarget,
    deleteUserMutation,
    deleteDriverMutation,
    deleteCarMutation,
    handleUsersChanged,
    handleDriversChanged,
    handleCarsChanged,
  }
}
