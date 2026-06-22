import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { Company } from '@fuel-carrier/shared-types'
import { ApiErrorCode } from '@fuel-carrier/shared-types'
import { isApiClientError } from '@fuel-carrier/web-ui/api'
import { useQuery } from '@fuel-carrier/web-ui/query'
import { Button } from '@fuel-carrier/web-ui/ui'
import { ArrowLeft } from '@fuel-carrier/web-ui/icons'
import { CompanyDetailCard } from '../../components/companies/CompanyDetailCard'
import { CompanyDetailResources } from '../../components/companies/detail/CompanyDetailResources'
import { companyKeys, fetchCompany } from '../../lib/api/companies'

export const Route = createFileRoute('/_authenticated/companies/$companyId')({
  component: CompanyDetailPage,
})

function CompanyDetailPage() {
  const { companyId } = Route.useParams()
  const { LL } = useI18nContext()
  const navigate = useNavigate()

  const companyQuery = useQuery<Company>({
    queryKey: companyKeys.detail(companyId),
    queryFn: function loadCompany() {
      return fetchCompany(companyId)
    },
  })

  const isNotFound =
    companyQuery.isError &&
    isApiClientError(companyQuery.error) &&
    companyQuery.error.apiError.code === ApiErrorCode.NOT_FOUND

  function handleBackToList() {
    void navigate({ to: '/companies' })
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <Link
          to="/companies"
          className="mb-4 inline-flex items-center gap-2 text-sm text-base-content/50 transition-colors hover:text-base-content"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {LL.internalPanel.companies.backToList()}
        </Link>

        {companyQuery.isLoading ? (
          <p className="text-sm text-base-content/50">
            {LL.internalPanel.companies.loading()}
          </p>
        ) : isNotFound || !companyQuery.data ? (
          <div className="rounded-2xl border border-base-content/8 bg-base-200/40 p-6 backdrop-blur-sm">
            <h1 className="text-xl font-semibold tracking-tight">
              {LL.internalPanel.companies.notFound()}
            </h1>
            <p className="mt-2 text-sm text-base-content/50">
              {LL.internalPanel.companies.notFoundDescription()}
            </p>
            <Button
              type="button"
              variant="ghost"
              className="mt-4 h-10 border border-base-content/8 bg-base-100/40 px-4"
              onClick={handleBackToList}
            >
              {LL.internalPanel.companies.backToList()}
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {companyQuery.data.name}
            </h1>
            <p className="mt-1 text-sm text-base-content/50">
              {LL.internalPanel.companies.subtitle()}
            </p>
          </>
        )}
      </div>

      {companyQuery.data && (
        <>
          <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-6 backdrop-blur-sm">
            <CompanyDetailCard company={companyQuery.data} />
          </section>
          <CompanyDetailResources companyId={companyId} />
        </>
      )}
    </div>
  )
}
