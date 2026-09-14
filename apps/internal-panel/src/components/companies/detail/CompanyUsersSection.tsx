import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Pagination } from '@fuel-carrier/web-ui/ui'
import { getUserColumns } from './companyResourceColumns'
import { CompanyUserFormModal } from './CompanyUserFormModal'
import { DeleteCompanyUserModal } from './DeleteCompanyUserModal'
import { ResourceSection } from './ResourceSection'
import { useCompanyUsers } from './useCompanyUsers'

interface CompanyUsersSectionProps {
  companyId: string
}

export function CompanyUsersSection({ companyId }: CompanyUsersSectionProps) {
  const { LL } = useI18nContext()
  const users = useCompanyUsers(companyId)
  const emptyCell = LL.internalPanel.companies.emptyCell()
  const result = users.usersQuery.data

  return (
    <>
      <ResourceSection
        title={LL.internalPanel.companies.detail.usersTitle()}
        subtitle={LL.internalPanel.companies.detail.usersSubtitle()}
        addLabel={LL.internalPanel.companies.detail.addUser()}
        emptyLabel={LL.internalPanel.companies.detail.usersEmpty()}
        loading={users.usersQuery.isLoading && !result}
        items={users.companyUsers}
        columns={getUserColumns({ LL, emptyCell })}
        onAdd={function openCreateUser() {
          users.setUserModal({ mode: 'create' })
        }}
        onEdit={function openEditUser(user) {
          users.setUserModal({ mode: 'edit', item: user })
        }}
        onDelete={users.setDeleteTarget}
        footer={
          result ? (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              totalItems={result.totalItems}
              limit={result.limit}
              onPageChange={users.handlePageChange}
              onLimitChange={users.handleLimitChange}
              labels={LL.common.pagination}
            />
          ) : null
        }
      />

      {users.userModal && (
        <CompanyUserFormModal
          key={
            users.userModal.mode === 'edit'
              ? `user-edit-${users.userModal.item.id}`
              : 'user-create'
          }
          mode={users.userModal.mode}
          companyId={companyId}
          user={users.userModal.mode === 'edit' ? users.userModal.item : undefined}
          onClose={function closeUserModal() {
            users.setUserModal(null)
          }}
          onSuccess={users.handleChanged}
        />
      )}

      <DeleteCompanyUserModal
        target={users.deleteTarget}
        mutation={users.deleteMutation}
        onClose={function closeDeleteModal() {
          users.setDeleteTarget(null)
        }}
      />
    </>
  )
}
