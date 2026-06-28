import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { ApiErrorCode } from '@fuel-carrier/shared-types'
import { zodResolver, Form, useForm } from '@fuel-carrier/web-ui/form'
import { isApiClientError } from '@fuel-carrier/web-ui/api'
import { Button, FormInput, LocaleControls } from '@fuel-carrier/web-ui/ui'
import { useMemo, useState } from 'react'
import { login } from '../lib/api/auth'
import { sanitizeRedirectPath } from '../lib/redirect'
import {
  createLoginDtoSchema,
  type LoginDto,
} from '@fuel-carrier/shared-validation/admin/login'
import { PASSWORD_MIN_LENGTH } from '@fuel-carrier/shared-validation/password'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { redirect } = useSearch({ from: '/login' })
  const { LL } = useI18nContext()
  const [serverError, setServerError] = useState<string | null>(null)

  const loginSchema = useMemo(
    function createSchema() {
      return createLoginDtoSchema({
        usernameRequired: LL.validation.usernameRequired(),
        usernameInvalid: LL.validation.usernameInvalid(),
        passwordRequired: LL.validation.passwordRequired(),
        passwordStrength: {
          minLength: LL.validation.passwordMinLength({ min: PASSWORD_MIN_LENGTH }),
          uppercase: LL.validation.passwordUppercase(),
          lowercase: LL.validation.passwordLowercase(),
          digit: LL.validation.passwordDigit(),
          special: LL.validation.passwordSpecial(),
        },
      })
    },
    [LL],
  )

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const { formState: { isSubmitting } } = form

  async function onSubmit(data: LoginDto) {
    setServerError(null)
    try {
      await login(data)
      await navigate({ to: sanitizeRedirectPath(redirect) })
    } catch (error) {
      if (
        isApiClientError(error) &&
        error.apiError.code === ApiErrorCode.UNAUTHORIZED
      ) {
        setServerError(LL.internalPanel.login.invalidCredentials())
        return
      }

      if (isApiClientError(error)) {
        setServerError(error.apiError.message)
        return
      }

      setServerError(LL.internalPanel.login.invalidCredentials())
    }
  }

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-base-100 p-6">
      <LocaleControls />

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
          <a
            href="https://www.inergy.ir"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto mb-5 inline-flex rounded-lg transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
          >
            <img
              src="/inergy-logo.png"
              alt="Inergy"
              className="h-10 w-auto max-w-[11rem] object-contain sm:h-11"
            />
          </a>
          <h1 className="text-xl font-semibold tracking-tight">
            {LL.internalPanel.login.title()}
          </h1>
          <p className="mt-1 text-sm text-base-content/40">
            {LL.internalPanel.login.subtitle()}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-base-content/8 bg-base-200/50 p-6 shadow-xl backdrop-blur-md">
          <Form
            form={form}
            onSubmit={onSubmit}
            noValidate
            className="flex flex-col gap-4"
          >
            <FormInput
              name="username"
              label={LL.internalPanel.login.username()}
              type="text"
              autoComplete="username"
              autoFocus
              placeholder={LL.internalPanel.login.usernamePlaceholder()}
            />

            <FormInput
              name="password"
              label={LL.internalPanel.login.password()}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
            />

            {serverError && (
              <div className="rounded-lg border border-error/20 bg-error/8 px-3 py-2 text-xs text-error">
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              loading={isSubmitting}
              loadingText={LL.internalPanel.login.signingIn()}
              className="mt-1"
            >
              {LL.internalPanel.login.signIn()}
            </Button>
          </Form>
        </div>
      </div>
    </main>
  )
}
