import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/cars')({
  component: CarsLayout,
})

function CarsLayout() {
  return <Outlet />
}
