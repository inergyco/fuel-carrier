import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '../../components/dashboard/DashboardPage'

export const Route = createFileRoute('/panel/')({
  component: HomePage,
})

function HomePage() {
  return <DashboardPage />
}
