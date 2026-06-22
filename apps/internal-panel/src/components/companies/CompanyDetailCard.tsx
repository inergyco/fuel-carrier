import type { Company } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'

interface CompanyDetailCardProps {
  company: Company
}

interface DetailFieldProps {
  label: string
  value: string | null
  multiline?: boolean
}

function DetailField({ label, value, multiline = false }: DetailFieldProps) {
  const { LL } = useI18nContext()
  const displayValue = value ?? LL.internalPanel.companies.emptyCell()

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
        {label}
      </span>
      <div
        className={
          multiline
            ? 'min-h-24 w-full rounded-lg border border-base-content/10 bg-base-100/60 px-3 py-2 text-sm tracking-wide break-words whitespace-pre-wrap'
            : 'min-h-10 w-full rounded-lg border border-base-content/10 bg-base-100/60 px-3 py-2 text-sm tracking-wide break-words'
        }
      >
        {displayValue}
      </div>
    </div>
  )
}

export function CompanyDetailCard({ company }: CompanyDetailCardProps) {
  const { LL } = useI18nContext()

  return (
    <div className="flex flex-col gap-4">
      <DetailField
        label={LL.internalPanel.companies.name()}
        value={company.name}
      />
      <DetailField
        label={LL.internalPanel.companies.nationalId()}
        value={company.nationalId}
      />
      <DetailField
        label={LL.internalPanel.companies.phoneNumber()}
        value={company.phoneNumber}
      />
      <DetailField
        label={LL.internalPanel.companies.address()}
        value={company.address}
      />
      <DetailField
        label={LL.internalPanel.companies.note()}
        value={company.note}
        multiline
      />
    </div>
  )
}
