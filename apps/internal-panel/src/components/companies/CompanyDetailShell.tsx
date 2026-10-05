import type { ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  Button,
  ICON_STROKE_WIDTH,
  PageHeader,
  QueryErrorState,
  iconMdClassName,
} from '@fuel-carrier/web-ui/ui'
import { ArrowLeft } from '@fuel-carrier/web-ui/icons'
import { cn } from '@fuel-carrier/web-ui/utils'
import { CompanyResourceNav } from './detail/CompanyResourceNav'
import { useCompanyQuery } from './useCompanyQuery'

interface CompanyDetailShellProps {
  companyId: string
  children: ReactNode
}

export function CompanyDetailShell({ companyId, children }: CompanyDetailShellProps) {
  const { LL } = useI18nContext()
  const navigate = useNavigate()
  const { companyQuery, isNotFound } = useCompanyQuery(companyId)

  function handleBackToList() {
    void navigate({ to: '/companies' })
  }

  function renderHeader() {
    if (companyQuery.isLoading) {
      return (
        <p className="text-sm text-base-content/50">
          {LL.internalPanel.companies.loading()}
        </p>
      )
    }

    if (isNotFound) {
      return (
        <div className="rounded-2xl border border-base-content/8 bg-base-200/40 p-6 backdrop-blur-sm">
          <PageHeader
            title={LL.internalPanel.companies.notFound()}
            subtitle={LL.internalPanel.companies.notFoundDescription()}
          />
          <Button
            type="button"
            variant="ghost"
            className="mt-4 h-10 border border-base-content/8 bg-base-100/40 px-4"
            onClick={handleBackToList}
          >
            {LL.internalPanel.companies.backToList()}
          </Button>
        </div>
      )
    }

    if (companyQuery.isError || !companyQuery.data) {
      return (
        <QueryErrorState
          onRetry={() => {
            void companyQuery.refetch()
          }}
          labels={{
            loadFailed: LL.common.queryError.loadFailed(),
            retry: LL.common.queryError.retry(),
          }}
        />
      )
    }

    return (
      <PageHeader
        title={companyQuery.data.name}
        subtitle={LL.internalPanel.companies.subtitle()}
      />
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/companies"
          className="mb-4 inline-flex items-center gap-2 text-sm text-base-content/65 transition-colors hover:text-base-content"
        >
          <ArrowLeft
            className={cn(iconMdClassName, 'rtl:rotate-180')}
            strokeWidth={ICON_STROKE_WIDTH}
            aria-hidden
          />
          {LL.internalPanel.companies.backToList()}
        </Link>

        {renderHeader()}
      </div>

      {companyQuery.data ? (
        <>
          <CompanyResourceNav companyId={companyId} />
          <div className="mt-6">{children}</div>
        </>
      ) : null}
    </div>
  )
}
