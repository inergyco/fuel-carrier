import type { ReactNode } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Button, QueryErrorState } from '@fuel-carrier/web-ui/ui'
import { CompanyResourceNav } from './detail/CompanyResourceNav'
import { useCompanyQuery } from './useCompanyQuery'

interface CompanyDetailShellProps {
  companyId: string
  children: ReactNode
}

export function CompanyDetailShell({
  companyId,
  children,
}: CompanyDetailShellProps) {
  const { LL } = useI18nContext()
  const navigate = useNavigate()
  const { companyQuery, isNotFound } = useCompanyQuery(companyId)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isCarDetail = /^\/companies\/[^/]+\/cars\/[^/]+$/.test(pathname)

  function handleBackToList() {
    void navigate({ to: '/companies' })
  }

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
        <Button
          type="button"
          variant="ghost"
          className="h-10 border border-base-content/8 bg-base-100/40 px-4"
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

  if (isCarDetail) {
    return <div>{children}</div>
  }

  return (
    <div>
      <CompanyResourceNav companyId={companyId} />
      <div className="mt-6">{children}</div>
    </div>
  )
}
