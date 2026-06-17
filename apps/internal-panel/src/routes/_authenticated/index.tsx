import {
  createFileRoute,
  getRouteApi,
  useNavigate,
} from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { useQueryClient } from '@fuel-carrier/web-ui/query'
import { LocaleControls } from '@fuel-carrier/web-ui/ui'
import { useState } from 'react'
import { authKeys, logout } from '../../lib/auth'
import { sanitizeRedirectPath } from '../../lib/redirect'

const authenticatedRoute = getRouteApi('/_authenticated')

export const Route = createFileRoute('/_authenticated/')({
  component: HomePage,
})

function HomePage() {
  const { user } = authenticatedRoute.useRouteContext()
  const { LL } = useI18nContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await logout()
      queryClient.removeQueries({ queryKey: authKeys.me })
      await navigate({
        to: '/login',
        search: { redirect: sanitizeRedirectPath(location.href) },
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-4 p-8">
      <LocaleControls />
      <h1 className="text-3xl font-bold">{LL.internalPanel.home.title()}</h1>
      <p className="text-base-content/70">
        {LL.internalPanel.home.signedInAs({
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
        })}
      </p>
      <button
        type="button"
        className="btn btn-outline"
        disabled={isLoggingOut}
        onClick={handleLogout}
      >
        {isLoggingOut
          ? LL.internalPanel.home.signingOut()
          : LL.internalPanel.home.signOut()}
      </button>
    </main>
  )
}
