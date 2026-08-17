import { useNavigate } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Button } from '@fuel-carrier/web-ui/ui'
import { CompanyCarDetailBackLink } from './CompanyCarDetailBackLink'

type CompanyCarDetailNotFoundProps = {
  companyId: string
}

export function CompanyCarDetailNotFound({
  companyId,
}: CompanyCarDetailNotFoundProps) {
  const { LL } = useI18nContext()
  const navigate = useNavigate()

  function handleBackToList() {
    void navigate({
      to: '/companies/$companyId/cars',
      params: { companyId },
    })
  }

  return (
    <div>
      <div className="mb-6">
        <CompanyCarDetailBackLink companyId={companyId} />
        <div className="rounded-2xl border border-base-content/8 bg-base-200/40 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold tracking-tight">
            {LL.internalPanel.companies.detail.carNotFound()}
          </h2>
          <p className="mt-2 text-sm text-base-content/50">
            {LL.internalPanel.companies.detail.carNotFoundDescription()}
          </p>
          <Button
            type="button"
            variant="ghost"
            className="mt-4 h-10 border border-base-content/8 bg-base-100/40 px-4"
            onClick={handleBackToList}
          >
            {LL.internalPanel.companies.detail.backToCars()}
          </Button>
        </div>
      </div>
    </div>
  )
}
