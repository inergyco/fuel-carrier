import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Select } from '@fuel-carrier/web-ui/ui'
import type { ChangeEvent } from 'react'
import { useActiveCompany } from './activeCompanyContext'

export function CompanySwitcher() {
  const { LL } = useI18nContext()
  const { companyId, setCompanyId, companies, isLoading, hasCompanies } =
    useActiveCompany()

  const selectedName =
    companies.find((company) => company.id === companyId)?.name ??
    LL.internalPanel.shell.companySwitcherLoading()

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextCompanyId = event.target.value
    if (nextCompanyId) {
      setCompanyId(nextCompanyId)
    }
  }

  if (!isLoading && !hasCompanies) {
    return null
  }

  return (
    <div className="grid w-full min-w-0 max-w-full sm:w-max sm:max-w-[min(36rem,calc(100vw-14rem))]">
      <span
        aria-hidden
        className="invisible col-start-1 row-start-1 whitespace-pre px-8 text-sm"
      >
        {selectedName}
      </span>
      <div className="col-start-1 row-start-1 min-w-0">
        <Select
          aria-label={LL.internalPanel.shell.companySwitcherLabel()}
          title={selectedName}
          value={companyId ?? ''}
          onChange={handleChange}
          disabled={isLoading || !hasCompanies}
          className="h-11 min-h-11 w-full min-w-0 max-w-full tracking-normal"
        >
          {isLoading ? (
            <option value="">
              {LL.internalPanel.shell.companySwitcherLoading()}
            </option>
          ) : (
            companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))
          )}
        </Select>
      </div>
    </div>
  )
}
