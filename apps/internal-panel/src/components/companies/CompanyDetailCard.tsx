import type { Company } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { useQueryClient } from '@fuel-carrier/web-ui/query'
import { CompanyLogoUploader, useToast } from '@fuel-carrier/web-ui/ui'
import { cn } from '@fuel-carrier/web-ui/utils'
import {
  companyKeys,
  removeCompanyLogo,
  replaceCompanyLogo,
  uploadCompanyLogo,
} from '../../lib/api/companies'

interface CompanyDetailCardProps {
  company: Company
}

interface DetailFieldItem {
  key: string
  label: string
  value: string | null
  multiline?: boolean
}

export function CompanyDetailCard({ company }: CompanyDetailCardProps) {
  const { LL } = useI18nContext()
  const queryClient = useQueryClient()
  const toast = useToast()

  async function handleUploadLogo(file: File) {
    const uploaded = await uploadCompanyLogo(file)
    await replaceCompanyLogo(company.id, uploaded.logoUrl)
    await queryClient.invalidateQueries({ queryKey: companyKeys.all })
    toast.success(LL.internalPanel.toast.companyUpdated())
  }

  async function handleRemoveLogo() {
    await removeCompanyLogo(company.id)
    await queryClient.invalidateQueries({ queryKey: companyKeys.all })
    toast.success(LL.internalPanel.toast.companyUpdated())
  }

  const companyFields: DetailFieldItem[] = [
    {
      key: 'name',
      label: LL.internalPanel.companies.name(),
      value: company.name,
    },
    {
      key: 'nationalId',
      label: LL.internalPanel.companies.nationalId(),
      value: company.nationalId,
    },
    {
      key: 'phoneNumber',
      label: LL.internalPanel.companies.phoneNumber(),
      value: company.phoneNumber,
    },
    {
      key: 'address',
      label: LL.internalPanel.companies.address(),
      value: company.address,
    },
    {
      key: 'note',
      label: LL.internalPanel.companies.note(),
      value: company.note,
      multiline: true,
    },
  ]

  function renderDetailField(field: DetailFieldItem) {
    return (
      <DetailField
        key={field.key}
        label={field.label}
        value={field.value}
        multiline={field.multiline}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <CompanyLogoUploader
        logoUrl={company.logoUrl}
        onUploadFile={handleUploadLogo}
        onRemove={handleRemoveLogo}
      />
      {companyFields.map(renderDetailField)}
    </div>
  )
}

function DetailField({
  label,
  value,
  multiline = false,
}: Omit<DetailFieldItem, 'key'>) {
  const { LL } = useI18nContext()
  const displayValue = value ?? LL.internalPanel.companies.emptyCell()

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
        {label}
      </span>
      <div
        className={cn(
          'w-full rounded-lg border border-base-content/10 bg-base-100/60 px-3 py-2 text-sm tracking-wide wrap-break-word',
          multiline
            ? 'min-h-24 whitespace-pre-wrap'
            : 'min-h-10',
        )}
      >
        {displayValue}
      </div>
    </div>
  )
}
