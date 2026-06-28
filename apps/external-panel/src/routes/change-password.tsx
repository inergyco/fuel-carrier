import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { ApiErrorCode } from '@fuel-carrier/shared-types'
import {
  createChangePasswordDtoSchema,
  type ChangePasswordDto,
} from '@fuel-carrier/shared-validation/auth/change-password'
import { PASSWORD_MIN_LENGTH } from '@fuel-carrier/shared-validation/password'
import { zodResolver, Form, useForm } from '@fuel-carrier/web-ui/form'
import { isApiClientError } from '@fuel-carrier/web-ui/api'
import { useQueryClient } from '@fuel-carrier/web-ui/query'
import { Button, FormInput } from '@fuel-carrier/web-ui/ui'
import { useMemo, useState } from 'react'
import { AuthPageShell } from '../components/AuthPageShell'
import { authKeys, changePassword, fetchMe } from '../lib/api/auth'

export const Route = createFileRoute('/change-password')({
  beforeLoad: async ({ context }) => {
    try {
      const user = await context.queryClient.fetchQuery({
        queryKey: authKeys.me,
        queryFn: fetchMe,
        staleTime: 0,
      })

      if (!user.mustChangePassword) {
        throw redirect({ to: '/' })
      }

      return { user }
    } catch (error) {
      if (error && typeof error === 'object' && 'isRedirect' in error) {
        throw error
      }

      throw redirect({ to: '/login', search: { redirect: undefined } })
    }
  },
  component: ChangePasswordPage,
})

function ChangePasswordPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { LL } = useI18nContext()
  const [serverError, setServerError] = useState<string | null>(null)

  const changePasswordSchema = useMemo(
    function createSchema() {
      return createChangePasswordDtoSchema({
        currentPasswordRequired: LL.validation.passwordRequired(),
        newPasswordRequired: LL.validation.passwordRequired(),
        confirmPasswordRequired: LL.validation.passwordRequired(),
        passwordsMustMatch: LL.externalPanel.changePassword.passwordsMustMatch(),
        newPasswordMustDiffer: LL.externalPanel.changePassword.newPasswordMustDiffer(),
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
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const { formState: { isSubmitting } } = form

  async function onSubmit(data: ChangePasswordDto) {
    setServerError(null)
    try {
      const user = await changePassword(data)
      queryClient.setQueryData(authKeys.me, user)
      await navigate({ to: '/' })
    } catch (error) {
      if (
        isApiClientError(error) &&
        error.apiError.code === ApiErrorCode.UNAUTHORIZED
      ) {
        setServerError(LL.externalPanel.changePassword.incorrectCurrentPassword())
        return
      }

      if (isApiClientError(error)) {
        setServerError(error.apiError.message)
        return
      }

      setServerError(LL.externalPanel.changePassword.failed())
    }
  }

  return (
    <AuthPageShell
      title={LL.externalPanel.changePassword.title()}
      subtitle={LL.externalPanel.changePassword.subtitle()}
    >
      <Form
        form={form}
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        <FormInput
          name="currentPassword"
          label={LL.externalPanel.changePassword.currentPassword()}
          type="password"
          autoComplete="current-password"
          autoFocus
          placeholder={LL.externalPanel.changePassword.currentPasswordPlaceholder()}
        />

        <FormInput
          name="newPassword"
          label={LL.externalPanel.changePassword.newPassword()}
          type="password"
          autoComplete="new-password"
          placeholder={LL.externalPanel.changePassword.newPasswordPlaceholder()}
        />

        <FormInput
          name="confirmPassword"
          label={LL.externalPanel.changePassword.confirmPassword()}
          type="password"
          autoComplete="new-password"
          placeholder={LL.externalPanel.changePassword.confirmPasswordPlaceholder()}
        />

        {serverError && (
          <div className="rounded-lg border border-error/20 bg-error/8 px-3 py-2 text-xs text-error">
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          loading={isSubmitting}
          loadingText={LL.externalPanel.changePassword.submitting()}
          className="mt-1 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
        >
          {LL.externalPanel.changePassword.submit()}
        </Button>
      </Form>
    </AuthPageShell>
  )
}
