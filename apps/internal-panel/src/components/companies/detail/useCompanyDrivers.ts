import { useMemo, useState } from 'react'
import type { Driver } from '@fuel-carrier/shared-types'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { carKeys } from '../../../lib/api/cars'
import { deleteDriver, driverKeys, fetchDrivers } from '../../../lib/api/drivers'
import type { EntityModalState } from './entity-modal-state'

export function useCompanyDrivers(companyId: string) {
  const queryClient = useQueryClient()
  const [driverModal, setDriverModal] = useState<EntityModalState<Driver>>(null)
  const [deleteTarget, setDeleteTarget] = useState<Driver | null>(null)

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

  const deleteMutation = useMutation({
    mutationFn: deleteDriver,
    onSuccess: async function onDriverDeleted() {
      await queryClient.invalidateQueries({ queryKey: driverKeys.all })
      await queryClient.invalidateQueries({ queryKey: carKeys.all })
      setDeleteTarget(null)
    },
  })

  async function handleChanged() {
    await queryClient.invalidateQueries({ queryKey: driverKeys.all })
  }

  return {
    driversQuery,
    companyDrivers,
    driverModal,
    setDriverModal,
    deleteTarget,
    setDeleteTarget,
    deleteMutation,
    handleChanged,
  }
}
