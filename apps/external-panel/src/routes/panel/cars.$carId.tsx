import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/panel/cars/$carId')({
  component: CarDetailLayout,
})

function CarDetailLayout() {
  return <Outlet />
}
