import type { Company } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { CompanyOperations } from './CompanyOperations'

interface CompaniesCardListProps {
  companies: Company[]
  onEdit: (company: Company) => void
  onDelete: (company: Company) => void
}

export function CompaniesCardList({
  companies,
  onEdit,
  onDelete,
}: CompaniesCardListProps) {
  const { LL } = useI18nContext()

  return (
    <ul className="flex flex-col gap-3 md:hidden">
      {companies.map(function renderCompanyCard(company) {
        return (
          <li
            key={company.id}
            className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-sm"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <p className="text-base font-medium tracking-tight">{company.name}</p>
            </div>

            <dl className="grid gap-2 text-sm text-base-content/70">
              <div>
                <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
                  {LL.internalPanel.companies.nationalId()}
                </dt>
                <dd className="mt-1 font-mono">{company.nationalId}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
                  {LL.internalPanel.companies.phoneNumber()}
                </dt>
                <dd className="mt-1">{company.phoneNumber}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
                  {LL.internalPanel.companies.address()}
                </dt>
                <dd className="mt-1">
                  {company.address ?? LL.internalPanel.companies.emptyCell()}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
                  {LL.internalPanel.companies.note()}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap">
                  {company.note ?? LL.internalPanel.companies.emptyCell()}
                </dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-base-content/8 pt-4">
              <CompanyOperations
                company={company}
                onEdit={onEdit}
                onDelete={onDelete}
                layout="stacked"
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
