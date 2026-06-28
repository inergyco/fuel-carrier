import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useI18nContext } from "@fuel-carrier/i18n/react";
import { ApiErrorCode } from "@fuel-carrier/shared-types";
import {
  createLoginDtoSchema,
  type LoginDto,
} from "@fuel-carrier/shared-validation/admin/login";
import { PASSWORD_MIN_LENGTH } from "@fuel-carrier/shared-validation/password";
import { zodResolver, Form, useForm } from "@fuel-carrier/web-ui/form";
import { isApiClientError } from "@fuel-carrier/web-ui/api";
import { Button, FormInput, ICON_STROKE_WIDTH } from "@fuel-carrier/web-ui/ui";
import { Shield } from "@fuel-carrier/web-ui/icons";
import { useMemo, useState } from "react";
import { AuthPageShell } from "../components/AuthPageShell";
import { login } from "../lib/api/auth";
import { sanitizeRedirectPath } from "../lib/redirect";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const { LL } = useI18nContext();
  const [serverError, setServerError] = useState<string | null>(null);

  const loginSchema = useMemo(
    function createSchema() {
      return createLoginDtoSchema({
        usernameRequired: LL.validation.usernameRequired(),
        usernameInvalid: LL.validation.usernameInvalid(),
        passwordRequired: LL.validation.passwordRequired(),
        passwordStrength: {
          minLength: LL.validation.passwordMinLength({
            min: PASSWORD_MIN_LENGTH,
          }),
          uppercase: LL.validation.passwordUppercase(),
          lowercase: LL.validation.passwordLowercase(),
          digit: LL.validation.passwordDigit(),
          special: LL.validation.passwordSpecial(),
        },
      });
    },
    [LL],
  );

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const {
    formState: { isSubmitting },
  } = form;

  async function onSubmit(data: LoginDto) {
    setServerError(null);
    try {
      const user = await login(data);
      if (user.mustChangePassword) {
        await navigate({ to: "/change-password" });
        return;
      }
      await navigate({ to: sanitizeRedirectPath(redirect) });
    } catch (error) {
      if (
        isApiClientError(error) &&
        error.apiError.code === ApiErrorCode.UNAUTHORIZED
      ) {
        setServerError(LL.externalPanel.login.invalidCredentials());
        return;
      }

      if (isApiClientError(error)) {
        setServerError(error.apiError.message);
        return;
      }

      setServerError(LL.externalPanel.login.invalidCredentials());
    }
  }

  return (
    <AuthPageShell
      icon={<Shield strokeWidth={ICON_STROKE_WIDTH} aria-hidden />}
      title={LL.externalPanel.login.title()}
      subtitle={LL.externalPanel.login.subtitle()}
    >
      <Form
        form={form}
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        <FormInput
          name="username"
          label={LL.externalPanel.login.username()}
          type="text"
          autoComplete="username"
          autoFocus
          placeholder={LL.externalPanel.login.usernamePlaceholder()}
        />

        <FormInput
          name="password"
          label={LL.externalPanel.login.password()}
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
          loadingText={LL.externalPanel.login.signingIn()}
          className="mt-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          {LL.externalPanel.login.signIn()}
        </Button>
      </Form>
    </AuthPageShell>
  );
}
