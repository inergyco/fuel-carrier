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
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {LL.internalPanel.home.title()}
        </h1>
        <p className="mt-1 text-sm text-base-content/50">
          {LL.internalPanel.home.welcome({ firstName: user.firstName })}
        </p>
      </div>

      <div className="rounded-2xl border border-base-content/8 bg-base-200/40 p-6 backdrop-blur-sm">
        <p className="text-base-content/70">
          {LL.internalPanel.home.signedInAs({
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
          })}
        </p>
      </div>
    </div>
  )
}
