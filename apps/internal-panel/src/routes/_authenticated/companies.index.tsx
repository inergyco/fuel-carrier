import { createFileRoute } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { Company } from '@fuel-carrier/shared-types'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { Button, ConfirmModal, MEDIA_QUERIES, useMediaQuery } from '@fuel-carrier/web-ui/ui'
import { Plus } from '@fuel-carrier/web-ui/icons'
import { useState } from 'react'
import { CompaniesCardList } from '../../components/companies/CompaniesCardList'
import { CompaniesTable } from '../../components/companies/CompaniesTable'
import { CompanyFormModal } from '../../components/companies/CompanyFormModal'
import {
  companyKeys,
  deleteCompany,
  fetchCompanies,
} from '../../lib/api/companies'

export const Route = createFileRoute('/_authenticated/companies/')({
  component: CompaniesPage,
})

type FormModalState =
  | { mode: 'create' }
  | { mode: 'edit'; company: Company }
  | null

function CompaniesPage() {
  const { LL } = useI18nContext()
  const isMdUp = useMediaQuery(MEDIA_QUERIES.mdUp)
  const queryClient = useQueryClient()
  const [formModal, setFormModal] = useState<FormModalState>(null)
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null)

  const companiesQuery = useQuery<Company[]>({
    queryKey: companyKeys.all,
    queryFn: fetchCompanies,
  })

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteCompany,
    onSuccess: async function onDeleteSuccess() {
      await queryClient.invalidateQueries({ queryKey: companyKeys.all })
      setDeleteTarget(null)
    },
  })

  function handleOpenCreateModal() {
    setFormModal({ mode: 'create' })
  }

  function handleCloseFormModal() {
    setFormModal(null)
  }

  function handleEditCompany(company: Company) {
    setFormModal({ mode: 'edit', company })
  }

  function handleDeleteCompany(company: Company) {
    setDeleteTarget(company)
  }

  function handleCloseDeleteModal() {
    if (!deleteMutation.isPending) {
      setDeleteTarget(null)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return
    }

    await deleteMutation.mutateAsync(deleteTarget.id)
  }

  async function handleFormSuccess() {
    await queryClient.invalidateQueries({ queryKey: companyKeys.all })
  }

  const companies = companiesQuery.data ?? []

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {LL.internalPanel.companies.title()}
          </h1>
          <p className="mt-1 text-sm text-base-content/50">
            {LL.internalPanel.companies.subtitle()}
          </p>
        </div>

        <Button
          type="button"
          className="h-10 w-full sm:w-auto sm:px-5"
          onClick={handleOpenCreateModal}
        >
          <span className="flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            {LL.internalPanel.companies.create()}
          </span>
        </Button>
      </div>

      <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-sm md:p-0">
        {companiesQuery.isLoading ? (
          <p className="p-6 text-sm text-base-content/50">
            {LL.internalPanel.companies.loading()}
          </p>
        ) : companies.length === 0 ? (
          <p className="p-6 text-sm text-base-content/50">
            {LL.internalPanel.companies.empty()}
          </p>
        ) : (
          isMdUp ? (
            <CompaniesTable
              companies={companies}
              onEdit={handleEditCompany}
              onDelete={handleDeleteCompany}
            />
          ) : (
            <CompaniesCardList
              companies={companies}
              onEdit={handleEditCompany}
              onDelete={handleDeleteCompany}
            />
          )
        )}
      </section>

      {formModal && (
        <CompanyFormModal
          key={
            formModal.mode === 'edit'
              ? `edit-${formModal.company.id}`
              : 'create'
          }
          mode={formModal.mode}
          company={formModal.mode === 'edit' ? formModal.company : undefined}
          onClose={handleCloseFormModal}
          onSuccess={handleFormSuccess}
        />
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title={LL.internalPanel.companies.deleteConfirmTitle()}
        description={
          deleteTarget
            ? LL.internalPanel.companies.deleteConfirmDescription({
                name: deleteTarget.name,
              })
            : ''
        }
        confirmLabel={LL.internalPanel.companies.deleteConfirm()}
        cancelLabel={LL.internalPanel.nav.cancel()}
        confirmVariant="danger"
        loading={deleteMutation.isPending}
        loadingLabel={LL.internalPanel.companies.deleting()}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
      />
    </div>
  )
}
