import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@fuel-carrier/web-ui/query'
import { CompanyForm } from '../../components/companies/CompanyForm'
import { useCompanyQuery } from '../../components/companies/useCompanyQuery'
import { companyKeys } from '../../lib/api/companies'

export const Route = createFileRoute(
  '/_authenticated/companies/$companyId/edit',
)({
  component: EditCompanyPage,
})

function EditCompanyPage() {
  const { companyId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { companyQuery } = useCompanyQuery(companyId)

  async function handleSaved() {
    await queryClient.invalidateQueries({ queryKey: companyKeys.all })
    await navigate({
      to: '/companies/$companyId',
      params: { companyId },
    })
  }

  function handleCancel() {
    void navigate({
      to: '/companies/$companyId',
      params: { companyId },
    })
  }

  if (!companyQuery.data) {
    return null
  }

  return (
    <CompanyForm
      mode="edit"
      company={companyQuery.data}
      onCancel={handleCancel}
      onSaved={handleSaved}
    />
  )
}
