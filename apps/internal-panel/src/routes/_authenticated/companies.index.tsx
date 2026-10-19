import { createFileRoute, Link } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { Company } from '@fuel-carrier/shared-types'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { cn } from '@fuel-carrier/web-ui/utils'
import {
  buttonClassName,
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
            onDelete={handleDeleteCompany}
          />
        ) : (
          <CompaniesCardList
            companies={companies}
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
      <section className="rounded-2xl border border-base-content/8 bg-panel-card p-4 backdrop-blur-sm md:p-0">
        <div className="mb-4 flex flex-col gap-3 p-4 pb-0 md:flex-row md:items-center md:p-6 md:pb-0">
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
              'h-11 w-full shrink-0 sm:w-auto sm:self-start sm:px-5 md:self-auto',
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
      </section>

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
