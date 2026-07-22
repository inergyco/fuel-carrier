import type { ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Button, ICON_STROKE_WIDTH, iconMdClassName } from '@fuel-carrier/web-ui/ui'
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
          <CompanyResourceNav companyId={companyId} />
          <div className="mt-6">{children}</div>
        </>
      )}
    </div>
  )
}
