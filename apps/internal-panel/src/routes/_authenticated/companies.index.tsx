import { createFileRoute, Link } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { Company } from '@fuel-carrier/shared-types'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { cn } from '@fuel-carrier/web-ui/utils'
import {
  buttonClassName,
  ICON_STROKE_WIDTH,
  Pagination,
  QueryErrorState,
  ResourceListSkeleton,
  ResourceListToolbar,
  iconMdClassName,
  parseResourceListSearch,
  useResourceListSearch,
  useToast,
} from '@fuel-carrier/web-ui/ui'
import { Plus } from '@fuel-carrier/web-ui/icons'
import { useState } from 'react'
import { CompaniesCardList } from '../../components/companies/CompaniesCardList'
import { DeleteCompanyModal } from '../../components/companies/DeleteCompanyModal'
import {
  companyKeys,
  deleteCompany,
  fetchCompanies,
} from '../../lib/api/companies'

const COMPANY_CARD_GRID_CLASS_NAME =
  'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'

export const Route = createFileRoute('/_authenticated/companies/')({
  validateSearch: parseResourceListSearch,
  component: CompaniesPage,
})

const EMPTY_COMPANIES: Company[] = []

function CompaniesPage() {
  const { LL } = useI18nContext()
  const toast = useToast()
  const queryClient = useQueryClient()
  const {
    listParams,
    draftSearchText,
    setDraftSearchText,
    handlePageChange,
    handleLimitChange,
  } = useResourceListSearch()
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

  const result = companiesQuery.data
  const companies = result?.items ?? EMPTY_COMPANIES

  function renderBody() {
    if (companiesQuery.isLoading && !result) {
      return (
        <ResourceListSkeleton
          variant="cards"
          columns={4}
          label={LL.internalPanel.companies.loading()}
          listClassName={COMPANY_CARD_GRID_CLASS_NAME}
        />
      )
    }

    if (companiesQuery.isError) {
      return (
        <QueryErrorState
          onRetry={() => {
            void companiesQuery.refetch()
          }}
          labels={{
            loadFailed: LL.common.queryError.loadFailed(),
            retry: LL.common.queryError.retry(),
          }}
        />
      )
    }

    if (companies.length === 0) {
      return (
        <p className="text-sm text-base-content/50">
          {hasActiveSearch
            ? LL.internalPanel.companies.emptyFiltered()
            : LL.internalPanel.companies.empty()}
        </p>
      )
    }

    return (
      <>
        <CompaniesCardList
          companies={companies}
          onDelete={handleDeleteCompany}
        />
        {result ? (
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            totalItems={result.totalItems}
            limit={result.limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            labels={LL.common.pagination}
          />
        ) : null}
      </>
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <ResourceListToolbar
            searchPlaceholder={LL.internalPanel.companies.searchPlaceholder()}
            searchText={draftSearchText}
            onSearchTextChange={setDraftSearchText}
          />
        </div>
        <Link
          to="/companies/new"
          className={cn(
            buttonClassName.primary,
            'h-11 w-full shrink-0 sm:w-auto sm:self-start sm:px-5 lg:self-auto',
          )}
        >
          <span className="flex items-center justify-center gap-2">
            <Plus
              className={iconMdClassName}
              strokeWidth={ICON_STROKE_WIDTH}
              aria-hidden
            />
            {LL.internalPanel.companies.create()}
          </span>
        </Link>
      </div>

      {renderBody()}

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
