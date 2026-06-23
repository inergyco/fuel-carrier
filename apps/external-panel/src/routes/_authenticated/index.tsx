import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'

const authenticatedRoute = getRouteApi('/_authenticated')

export const Route = createFileRoute('/_authenticated/')({
  component: HomePage,
})

function HomePage() {
  const { user } = authenticatedRoute.useRouteContext()
  const { LL } = useI18nContext()

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="bg-gradient-to-br from-base-content to-base-content/60 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
          {LL.externalPanel.home.title()}
        </h1>
        <p className="mt-1 text-sm text-base-content/50">
          {LL.externalPanel.home.welcome({ firstName: user.firstName })}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-base-200/40 p-6 backdrop-blur-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute -end-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl"
        />
        <p className="relative text-base-content/70">
          {LL.externalPanel.home.signedInAs({
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
          })}
        </p>
      </div>
    </div>
  )
}
