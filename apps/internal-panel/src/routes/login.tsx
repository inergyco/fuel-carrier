import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { zodResolver, useForm } from '@fuel-carrier/web-ui/form'
import { Button, Input, ThemeToggle } from '@fuel-carrier/web-ui/ui'
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
      <ThemeToggle className="absolute top-4 right-4" />

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
            <Input
              label="Username"
              type="text"
              autoComplete="username"
              autoFocus
              placeholder="your_username"
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {serverError && (
              <div className="rounded-lg border border-error/20 bg-error/8 px-3 py-2 text-xs text-error">
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              loading={isSubmitting}
              loadingText="Signing in"
              className="mt-1"
            >
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
