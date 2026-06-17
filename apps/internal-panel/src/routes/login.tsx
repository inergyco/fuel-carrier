import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { zodResolver, useForm } from '@fuel-carrier/web-ui/form'
import { cn } from '@fuel-carrier/web-ui/utils'
import { useState } from 'react'
import { login } from '../lib/auth'
import { loginDtoSchema, type LoginDto } from '@fuel-carrier/shared-validation/admin/login'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { redirect } = useSearch({ from: '/login' })
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>({ resolver: zodResolver(loginDtoSchema) })

  async function onSubmit(data: LoginDto) {
    setServerError(null)
    try {
      await login(data)
      await navigate({ to: redirect ?? '/' })
    } catch {
      setServerError('Invalid username or password.')
    }
  }

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-base-100 p-6">
      {/* Background grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,oklch(var(--bc)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,oklch(var(--bc)/0.04)_1px,transparent_1px)] bg-[size:40px_40px]"
      />

      {/* Glow orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-base-content/10 bg-base-200/60 backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Internal Panel</h1>
          <p className="mt-1 text-sm text-base-content/40">Authorized access only</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-base-content/8 bg-base-200/50 p-6 shadow-xl backdrop-blur-md">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
                Username
              </label>
              <input
                type="text"
                autoComplete="username"
                autoFocus
                placeholder="your_username"
                className={cn(
                  'input input-sm h-10 w-full rounded-lg border bg-base-100/60 px-3 font-mono text-sm tracking-wide placeholder:text-base-content/20 focus:outline-none focus:ring-1',
                  errors.username
                    ? 'border-error/60 focus:ring-error/40'
                    : 'border-base-content/10 focus:ring-primary/40',
                )}
                {...register('username')}
              />
              {errors.username && (
                <p className="text-xs text-error/80">{errors.username.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn(
                  'input input-sm h-10 w-full rounded-lg border bg-base-100/60 px-3 font-mono text-sm tracking-wide placeholder:text-base-content/20 focus:outline-none focus:ring-1',
                  errors.password
                    ? 'border-error/60 focus:ring-error/40'
                    : 'border-base-content/10 focus:ring-primary/40',
                )}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-error/80">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div className="rounded-lg border border-error/20 bg-error/8 px-3 py-2 text-xs text-error">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'btn btn-primary btn-sm mt-1 h-10 w-full rounded-lg text-xs font-semibold tracking-widest uppercase transition-all',
                isSubmitting && 'opacity-60',
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-xs" />
                  Signing in
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
