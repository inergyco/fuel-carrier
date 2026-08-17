import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/companies/$companyId/cars')({
  component: CompanyCarsLayout,
})

function CompanyCarsLayout() {
  return <Outlet />
}
