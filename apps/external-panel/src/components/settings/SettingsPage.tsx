import { useI18nContext } from '@fuel-carrier/i18n/react'
import { useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { CompanyLogoUploader, useToast } from '@fuel-carrier/web-ui/ui'
import { authKeys, fetchMe } from '../../lib/api/auth'
import { removeCompanyLogo, uploadCompanyLogo } from '../../lib/api/company'

export function SettingsPage() {
  const { LL } = useI18nContext()
  const queryClient = useQueryClient()
  const toast = useToast()
  const meQuery = useQuery({
    queryKey: authKeys.me,
    queryFn: fetchMe,
  })

  async function refreshSession() {
    await queryClient.invalidateQueries({ queryKey: authKeys.me })
  }

  async function handleUploadLogo(file: File) {
    await uploadCompanyLogo(file)
    await refreshSession()
    toast.success(LL.externalPanel.toast.logoUpdated())
  }

  async function handleRemoveLogo() {
    await removeCompanyLogo()
    await refreshSession()
    toast.success(LL.externalPanel.toast.logoUpdated())
  }

  return (
    <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-sm sm:p-6">
      <div className="max-w-xl">
        <CompanyLogoUploader
          logoUrl={meQuery.data?.companyLogoUrl}
          onUploadFile={handleUploadLogo}
          onRemove={handleRemoveLogo}
        />
      </div>
    </section>
  )
}
