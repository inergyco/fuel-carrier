import { useState } from 'react'
import type { Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { usePagination, useToast } from '@fuel-carrier/web-ui/ui'
import { deleteDriver, driverKeys, fetchDrivers } from '../../lib/api/drivers'
import type { EntityModalState } from '../users/entity-modal-state'

const EMPTY_DRIVERS: Driver[] = []

export function useDrivers() {
  const { LL } = useI18nContext()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { pagination, handlePageChange, handleLimitChange } = usePagination()
  const [driverModal, setDriverModal] = useState<EntityModalState<Driver>>(null)
  const [deleteTarget, setDeleteTarget] = useState<Driver | null>(null)

  const driversQuery = useQuery({
    queryKey: driverKeys.list(pagination),
    queryFn: () => fetchDrivers(pagination),
    placeholderData: (previous) => previous,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDriver,
    onSuccess: async function onDriverDeleted() {
      await queryClient.invalidateQueries({
        queryKey: driverKeys.all,
      })
      setDeleteTarget(null)
      toast.success(LL.externalPanel.toast.driverDeleted())
    },
    onError: function onDriverDeleteError() {
      toast.error(LL.externalPanel.drivers.deleteFailed())
    },
  })

  async function handleChanged() {
    await queryClient.invalidateQueries({
      queryKey: driverKeys.all,
    })
  }

  return {
    driversQuery,
    items: driversQuery.data?.items ?? EMPTY_DRIVERS,
    driverModal,
    setDriverModal,
    deleteTarget,
    setDeleteTarget,
    deleteMutation,
    handleChanged,
    handlePageChange,
    handleLimitChange,
  }
}
