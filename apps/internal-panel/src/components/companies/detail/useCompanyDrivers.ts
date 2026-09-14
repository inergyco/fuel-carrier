import { useState } from 'react'
import type { Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { usePagination, useToast } from '@fuel-carrier/web-ui/ui'
import { carKeys } from '../../../lib/api/cars'
import { deleteDriver, driverKeys, fetchDrivers } from '../../../lib/api/drivers'
import type { EntityModalState } from './entity-modal-state'

const EMPTY_DRIVERS: Driver[] = []

export function useCompanyDrivers(companyId: string) {
  const { LL } = useI18nContext()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { pagination, handlePageChange, handleLimitChange } = usePagination()
  const [driverModal, setDriverModal] = useState<EntityModalState<Driver>>(null)
  const [deleteTarget, setDeleteTarget] = useState<Driver | null>(null)

  const driversQuery = useQuery({
    queryKey: driverKeys.byCompany(companyId, pagination),
    queryFn: () => fetchDrivers({ companyId, ...pagination }),
    placeholderData: (previous) => previous,
  })

  const companyDrivers = driversQuery.data?.items ?? EMPTY_DRIVERS

  const deleteMutation = useMutation({
    mutationFn: deleteDriver,
    onSuccess: async function onDriverDeleted() {
      await queryClient.invalidateQueries({ queryKey: driverKeys.all })
      await queryClient.invalidateQueries({ queryKey: carKeys.all })
      setDeleteTarget(null)
      toast.success(LL.internalPanel.toast.driverDeleted())
    },
    onError: function onDriverDeleteError() {
      toast.error(LL.internalPanel.companies.detail.deleteFailed())
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
    handlePageChange,
    handleLimitChange,
  }
}
