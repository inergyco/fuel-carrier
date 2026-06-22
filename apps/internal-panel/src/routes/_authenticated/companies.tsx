import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/companies')({
  component: CompaniesLayout,
})

function CompaniesLayout() {
  return <Outlet />
}
