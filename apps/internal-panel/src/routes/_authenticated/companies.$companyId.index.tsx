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
    <div className="mx-auto w-full max-w-3xl">
      <section className="rounded-2xl border border-base-content/8 bg-panel-card p-4 backdrop-blur-sm sm:p-6">
        <CompanyDetailCard company={companyQuery.data} />
      </section>
    </div>
  )
}
