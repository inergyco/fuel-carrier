import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@fuel-carrier/web-ui/query'
import type { Company } from '@fuel-carrier/shared-types'
import { CompanyForm } from '../../components/companies/CompanyForm'
import { companyKeys } from '../../lib/api/companies'

export const Route = createFileRoute('/_authenticated/companies/new')({
  component: CreateCompanyPage,
})

function CreateCompanyPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  async function handleSaved(company: Company) {
    await queryClient.invalidateQueries({ queryKey: companyKeys.all })
    await navigate({
      to: '/companies/$companyId',
      params: { companyId: company.id },
    })
  }

  function handleCancel() {
    void navigate({ to: '/companies' })
  }

  return (
    <CompanyForm mode="create" onCancel={handleCancel} onSaved={handleSaved} />
  )
}
