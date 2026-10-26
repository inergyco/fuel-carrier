import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/panel/cars')({
  component: CarsLayout,
})

function CarsLayout() {
  return <Outlet />
}
