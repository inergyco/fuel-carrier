import { useState } from 'react'
import type { Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { useToast } from '@fuel-carrier/web-ui/ui'
import { deleteDriver, driverKeys, fetchDrivers } from '../../lib/api/drivers'
import type { EntityModalState } from '../users/entity-modal-state'

export function useDrivers() {
  const { LL } = useI18nContext()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [driverModal, setDriverModal] = useState<EntityModalState<Driver>>(null)
  const [deleteTarget, setDeleteTarget] = useState<Driver | null>(null)

  const driversQuery = useQuery({
    queryKey: driverKeys.all,
    queryFn: fetchDrivers,
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
    driverModal,
    setDriverModal,
    deleteTarget,
    setDeleteTarget,
    deleteMutation,
    handleChanged,
  }
}
