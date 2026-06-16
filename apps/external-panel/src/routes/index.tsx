import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">External Panel</h1>
      <p className="text-base-content/70">
        TanStack Router and React Query are configured.
      </p>
    </main>
  )
}
