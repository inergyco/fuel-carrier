import { createFileRoute } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { Company } from '@fuel-carrier/shared-types'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import {
  Button,
  ConfirmModal,
  ICON_STROKE_WIDTH,
  MEDIA_QUERIES,
  Pagination,
  QueryErrorState,
  ResourceListSkeleton,
  iconMdClassName,
  parsePaginationSearch,
  useMediaQuery,
  usePagination,
  useToast,
} from '@fuel-carrier/web-ui/ui'
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
  validateSearch: parsePaginationSearch,
  component: CompaniesPage,
})

type FormModalState =
  | { mode: 'create' }
  | { mode: 'edit'; company: Company }
  | null

const EMPTY_COMPANIES: Company[] = []

function CompaniesPage() {
  const { LL } = useI18nContext()
  const toast = useToast()
  const isMdUp = useMediaQuery(MEDIA_QUERIES.mdUp)
  const queryClient = useQueryClient()
  const { pagination, handlePageChange, handleLimitChange } = usePagination()
  const [formModal, setFormModal] = useState<FormModalState>(null)
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null)

  const companiesQuery = useQuery({
    queryKey: companyKeys.list(pagination),
    queryFn: () => fetchCompanies(pagination),
    placeholderData: (previous) => previous,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCompany,
    onSuccess: async function onDeleteSuccess() {
      await queryClient.invalidateQueries({ queryKey: companyKeys.all })
      setDeleteTarget(null)
      toast.success(LL.internalPanel.toast.companyDeleted())
    },
    onError: function onDeleteError() {
      toast.error(LL.internalPanel.companies.deleteFailed())
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

  const result = companiesQuery.data
  const companies = result?.items ?? EMPTY_COMPANIES

  return (
    <div>
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
            <Plus className={iconMdClassName} strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
            {LL.internalPanel.companies.create()}
          </span>
        </Button>
      </div>

      <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-sm md:p-0">
        {companiesQuery.isLoading && !result ? (
          <div className="p-4 md:p-6">
            <ResourceListSkeleton
              variant={isMdUp ? 'table' : 'cards'}
              columns={5}
              label={LL.internalPanel.companies.loading()}
            />
          </div>
        ) : companiesQuery.isError ? (
          <div className="p-4 md:p-6">
            <QueryErrorState
              onRetry={() => {
                void companiesQuery.refetch()
              }}
              labels={{
                loadFailed: LL.common.queryError.loadFailed(),
                retry: LL.common.queryError.retry(),
              }}
            />
          </div>
        ) : companies.length === 0 ? (
          <p className="p-6 text-sm text-base-content/50">
            {LL.internalPanel.companies.empty()}
          </p>
        ) : (
          <>
            {isMdUp ? (
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
            )}
            {result ? (
              <div className="px-4 pb-4 md:px-6 md:pb-6">
                <Pagination
                  page={result.page}
                  totalPages={result.totalPages}
                  totalItems={result.totalItems}
                  limit={result.limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                  labels={LL.common.pagination}
                />
              </div>
            ) : null}
          </>
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
