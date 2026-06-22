import { useMemo, useState } from 'react'
import type { Car } from '@fuel-carrier/shared-types'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { carKeys, deleteCar, fetchCars } from '../../../lib/api/cars'
import { driverKeys, fetchDrivers } from '../../../lib/api/drivers'
import type { EntityModalState } from './entity-modal-state'

export function useCompanyCars(companyId: string) {
  const queryClient = useQueryClient()
  const [carModal, setCarModal] = useState<EntityModalState<Car>>(null)
  const [deleteTarget, setDeleteTarget] = useState<Car | null>(null)

  const carsQuery = useQuery({
    queryKey: carKeys.all,
    queryFn: fetchCars,
  })

  const driversQuery = useQuery({
    queryKey: driverKeys.all,
    queryFn: fetchDrivers,
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

  const deleteMutation = useMutation({
    mutationFn: deleteCar,
    onSuccess: async function onCarDeleted() {
      await queryClient.invalidateQueries({ queryKey: carKeys.all })
      setDeleteTarget(null)
    },
  })

  async function handleChanged() {
    await queryClient.invalidateQueries({ queryKey: carKeys.all })
  }

  return {
    carsQuery,
    companyDrivers,
    companyCars,
    driverNameById,
    carModal,
    setCarModal,
    deleteTarget,
    setDeleteTarget,
    deleteMutation,
    handleChanged,
  }
}
