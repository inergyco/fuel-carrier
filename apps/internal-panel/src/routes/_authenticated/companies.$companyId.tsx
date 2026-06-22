import { createFileRoute, Outlet } from '@tanstack/react-router'
import { CompanyDetailShell } from '../../components/companies/CompanyDetailShell'

export const Route = createFileRoute('/_authenticated/companies/$companyId')({
  component: CompanyLayoutPage,
})

function CompanyLayoutPage() {
  const { companyId } = Route.useParams()

  return (
    <CompanyDetailShell companyId={companyId}>
      <Outlet />
    </CompanyDetailShell>
  )
}
