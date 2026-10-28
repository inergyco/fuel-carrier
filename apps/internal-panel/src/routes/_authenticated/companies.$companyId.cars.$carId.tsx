import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/companies/$companyId/cars/$carId',
)({
  component: CompanyCarDetailLayout,
})

function CompanyCarDetailLayout() {
  return <Outlet />
}
