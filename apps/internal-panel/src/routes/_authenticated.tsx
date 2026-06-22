import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedShell } from '../components/AuthenticatedShell'
import { authKeys, fetchMe } from '../lib/api/auth'
import { sanitizeRedirectPath } from '../lib/redirect'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    try {
      const user = await context.queryClient.fetchQuery({
        queryKey: authKeys.me,
        queryFn: fetchMe,
        staleTime: 60_000,
      })

      return { user }
    } catch {
      throw redirect({
        to: '/login',
        search: { redirect: sanitizeRedirectPath(location.href) },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <AuthenticatedShell>
      <Outlet />
    </AuthenticatedShell>
  )
}
