import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { DashboardPage } from '../../components/dashboard/DashboardPage'

const authenticatedRoute = getRouteApi('/_authenticated')

export const Route = createFileRoute('/_authenticated/')({
  component: HomePage,
})

function HomePage() {
  const { user } = authenticatedRoute.useRouteContext()

  return <DashboardPage user={user} />
}
