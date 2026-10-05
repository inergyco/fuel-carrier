import { useI18nContext } from '@fuel-carrier/i18n/react'
import { isCompanyUserAdmin } from '@fuel-carrier/shared-types'
import { useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import {
  AppearanceSettings,
  CompanyLogoUploader,
  useToast,
} from '@fuel-carrier/web-ui/ui'
import { getRouteApi } from '@tanstack/react-router'
import { authKeys, fetchMe } from '../../lib/api/auth'
import { removeCompanyLogo, uploadCompanyLogo } from '../../lib/api/company'

const authenticatedRoute = getRouteApi('/_authenticated')

export function SettingsPage() {
  const { user } = authenticatedRoute.useRouteContext()
  const canManageLogo = isCompanyUserAdmin(user)
  const { LL } = useI18nContext()
  const queryClient = useQueryClient()
  const toast = useToast()
  const meQuery = useQuery({
    queryKey: authKeys.me,
    queryFn: fetchMe,
    enabled: canManageLogo,
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <AppearanceSettings />
      {canManageLogo ? (
        <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-xl sm:p-6">
          <CompanyLogoUploader
            logoUrl={meQuery.data?.companyLogoUrl}
            onUploadFile={handleUploadLogo}
            onRemove={handleRemoveLogo}
          />
        </section>
      ) : null}
    </div>
  )
}
