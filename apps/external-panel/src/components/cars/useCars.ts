import { useState } from 'react'
import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { fetchAllPaginated } from '@fuel-carrier/web-ui/api'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { useResourceListSearch, useToast } from '@fuel-carrier/web-ui/ui'
import { carKeys, deleteCar, fetchCars } from '../../lib/api/cars'
import { driverKeys, fetchDrivers } from '../../lib/api/drivers'
import type { EntityModalState } from '../users/entity-modal-state'

const EMPTY_CARS: Car[] = []

export function useCars() {
  const { LL } = useI18nContext()
  const toast = useToast()
  const queryClient = useQueryClient()
  const {
    listParams,
    draftSearchText,
    setDraftSearchText,
    setAssignment,
    handlePageChange,
    handleLimitChange,
    hasActiveFilters,
  } = useResourceListSearch()
  const [carModal, setCarModal] = useState<EntityModalState<Car>>(null)
  const [deleteTarget, setDeleteTarget] = useState<Car | null>(null)

  const carsQuery = useQuery({
    queryKey: carKeys.list(listParams),
    queryFn: () => fetchCars(listParams),
    placeholderData: (previous) => previous,
  })

  const driversQuery = useQuery({
    queryKey: [...driverKeys.all, 'all'] as const,
    queryFn: () => fetchAllPaginated(fetchDrivers),
  })

  const driverNameById = new Map(
    (driversQuery.data ?? []).map((driver) => [
      driver.id,
      `${driver.firstName} ${driver.lastName}`,
    ]),
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
    onError: () => toast.error(LL.externalPanel.cars.deleteFailed()),
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
    items: carsQuery.data?.items ?? EMPTY_CARS,
    driverNameById,
    carModal,
    setCarModal,
    deleteTarget,
    setDeleteTarget,
    deleteMutation,
    handleChanged,
    handlePageChange,
    handleLimitChange,
    draftSearchText,
    setDraftSearchText,
    setAssignment,
    assignment: listParams.assignment ?? 'all',
    hasActiveFilters,
  }
}
