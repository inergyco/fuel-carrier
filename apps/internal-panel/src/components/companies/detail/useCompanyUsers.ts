import { useState } from 'react'
import type { CompanyUser } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { useToast } from '@fuel-carrier/web-ui/ui'
import {
  companyUserKeys,
  deleteCompanyUser,
  fetchCompanyUsers,
} from '../../../lib/api/company-users'
import type { EntityModalState } from './entity-modal-state'

export function useCompanyUsers(companyId: string) {
  const { LL } = useI18nContext()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [userModal, setUserModal] = useState<EntityModalState<CompanyUser>>(null)
  const [deleteTarget, setDeleteTarget] = useState<CompanyUser | null>(null)

  const usersQuery = useQuery({
    queryKey: companyUserKeys.byCompany(companyId),
    queryFn: function loadUsers() {
      return fetchCompanyUsers(companyId)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCompanyUser,
    onSuccess: async function onUserDeleted() {
      await queryClient.invalidateQueries({
        queryKey: companyUserKeys.byCompany(companyId),
      })
      setDeleteTarget(null)
      toast.success(LL.internalPanel.toast.userDeleted())
    },
    onError: function onUserDeleteError() {
      toast.error(LL.internalPanel.companies.detail.deleteFailed())
    },
  })

  async function handleChanged() {
    await queryClient.invalidateQueries({
      queryKey: companyUserKeys.byCompany(companyId),
    })
  }

  return {
    usersQuery,
    userModal,
    setUserModal,
    deleteTarget,
    setDeleteTarget,
    deleteMutation,
    handleChanged,
  }
}
