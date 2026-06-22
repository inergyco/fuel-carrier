import { createFileRoute } from '@tanstack/react-router'
import { CompanyDetailCard } from '../../components/companies/CompanyDetailCard'
import { useCompanyQuery } from '../../components/companies/useCompanyQuery'

export const Route = createFileRoute('/_authenticated/companies/$companyId/')({
  component: CompanyDetailIndexPage,
})

function CompanyDetailIndexPage() {
  const { companyId } = Route.useParams()
  const { companyQuery } = useCompanyQuery(companyId)

  if (!companyQuery.data) {
    return null
  }

  return (
    <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-6 backdrop-blur-sm">
      <CompanyDetailCard company={companyQuery.data} />
    </section>
  )
}
