import { createFileRoute } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { Company } from '@fuel-carrier/shared-types'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import {
  Button,
  ICON_STROKE_WIDTH,
  MEDIA_QUERIES,
  Pagination,
  QueryErrorState,
  ResourceListSkeleton,
  ResourceListToolbar,
  iconMdClassName,
  parseResourceListSearch,
  useMediaQuery,
  useResourceListSearch,
  useToast,
} from '@fuel-carrier/web-ui/ui'
import { Plus } from '@fuel-carrier/web-ui/icons'
import { useState } from 'react'
import { CompaniesCardList } from '../../components/companies/CompaniesCardList'
import { CompaniesTable } from '../../components/companies/CompaniesTable'
import { CompanyFormModal } from '../../components/companies/CompanyFormModal'
import { DeleteCompanyModal } from '../../components/companies/DeleteCompanyModal'
import {
  companyKeys,
  deleteCompany,
  fetchCompanies,
} from '../../lib/api/companies'

export const Route = createFileRoute('/_authenticated/companies/')({
  validateSearch: parseResourceListSearch,
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
  const {
    listParams,
    draftSearchText,
    setDraftSearchText,
    handlePageChange,
    handleLimitChange,
  } = useResourceListSearch()
  const [formModal, setFormModal] = useState<FormModalState>(null)
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null)

  const companyListParams = {
    page: listParams.page,
    limit: listParams.limit,
    search: listParams.search,
  }
  const hasActiveSearch = Boolean(listParams.search)

  const companiesQuery = useQuery({
    queryKey: companyKeys.list(companyListParams),
    queryFn: () => fetchCompanies(companyListParams),
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

  function renderBody() {
    if (companiesQuery.isLoading && !result) {
      return (
        <div className="p-4 md:p-6">
          <ResourceListSkeleton
            variant={isMdUp ? 'table' : 'cards'}
            columns={5}
            label={LL.internalPanel.companies.loading()}
          />
        </div>
      )
    }

    if (companiesQuery.isError) {
      return (
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
      )
    }

    if (companies.length === 0) {
      return (
        <p className="p-6 text-sm text-base-content/50">
          {hasActiveSearch
            ? LL.internalPanel.companies.emptyFiltered()
            : LL.internalPanel.companies.empty()}
        </p>
      )
    }

    return (
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
    )
  }

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
        <div className="p-4 pb-0 md:p-6 md:pb-0">
          <ResourceListToolbar
            searchPlaceholder={LL.internalPanel.companies.searchPlaceholder()}
            searchText={draftSearchText}
            onSearchTextChange={setDraftSearchText}
            showAssignmentFilter={false}
          />
        </div>
        {renderBody()}
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

      {deleteTarget ? (
        <DeleteCompanyModal
          key={deleteTarget.id}
          company={deleteTarget}
          loading={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onCancel={handleCloseDeleteModal}
        />
      ) : null}
    </div>
  )
}
