import { Link } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { ICON_STROKE_WIDTH, iconMdClassName } from '@fuel-carrier/web-ui/ui'
import { ArrowLeft } from '@fuel-carrier/web-ui/icons'
import { cn } from '@fuel-carrier/web-ui/utils'

type CompanyCarDetailBackLinkProps = {
  companyId: string
}

export function CompanyCarDetailBackLink({
  companyId,
}: CompanyCarDetailBackLinkProps) {
  const { LL } = useI18nContext()

  return (
    <Link
      to="/companies/$companyId/cars"
      params={{ companyId }}
      className="mb-4 inline-flex items-center gap-2 text-sm text-base-content/65 transition-colors hover:text-base-content"
    >
      <ArrowLeft
        className={cn(iconMdClassName, 'rtl:rotate-180')}
        strokeWidth={ICON_STROKE_WIDTH}
        aria-hidden
      />
      {LL.internalPanel.companies.detail.backToCars()}
    </Link>
  )
}
