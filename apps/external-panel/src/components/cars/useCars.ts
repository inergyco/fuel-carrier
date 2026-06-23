import { useMemo, useState } from 'react'
import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { useToast } from '@fuel-carrier/web-ui/ui'
import { carKeys, deleteCar, fetchCars } from '../../lib/api/cars'
import { driverKeys, fetchDrivers } from '../../lib/api/drivers'
import type { EntityModalState } from '../users/entity-modal-state'

export function useCars() {
  const { LL } = useI18nContext()
  const toast = useToast()
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

  const driverNameById = useMemo(
    function mapDriverNames() {
      return new Map(
        (driversQuery.data ?? []).map(function toDriverEntry(driver) {
          return [driver.id, `${driver.firstName} ${driver.lastName}`]
        }),
      )
    },
    [driversQuery.data],
  )

  const deleteMutation = useMutation({
    mutationFn: deleteCar,
    onSuccess: async function onCarDeleted() {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: carKeys.all }),
        queryClient.invalidateQueries({ queryKey: driverKeys.all }),
      ])
      setDeleteTarget(null)
      toast.success(LL.externalPanel.toast.carDeleted())
    },
    onError: function onCarDeleteError() {
      toast.error(LL.externalPanel.cars.deleteFailed())
    },
  })

  async function handleChanged() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: carKeys.all }),
      queryClient.invalidateQueries({ queryKey: driverKeys.all }),
    ])
  }

  return {
    carsQuery,
    driversQuery,
    driverNameById,
    carModal,
    setCarModal,
    deleteTarget,
    setDeleteTarget,
    deleteMutation,
    handleChanged,
  }
}
