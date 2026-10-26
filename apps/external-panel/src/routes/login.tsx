import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useI18nContext } from "@fuel-carrier/i18n/react";
import { ApiErrorCode } from "@fuel-carrier/shared-types";
import {
  createLoginDtoSchema,
  type LoginDto,
} from "@fuel-carrier/shared-validation/admin/login";
import { zodResolver, Form, useForm } from "@fuel-carrier/web-ui/form";
import { isApiClientError } from "@fuel-carrier/web-ui/api";
import { ArrowLeft } from "@fuel-carrier/web-ui/icons";
import {
  Button,
  FormInput,
  ICON_STROKE_WIDTH,
  iconSmClassName,
} from "@fuel-carrier/web-ui/ui";
import { cn, sanitizeRedirectPath } from "@fuel-carrier/web-ui/utils";
import { useMemo, useState } from "react";
import { AuthPageShell } from "../components/AuthPageShell";
import { authKeys, fetchMe, login } from "../lib/api/auth";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  beforeLoad: async ({ context, search }) => {
    let user;
    try {
      user = await context.queryClient.fetchQuery({
        queryKey: authKeys.me,
        queryFn: fetchMe,
        staleTime: 60_000,
      });
    } catch {
      return;
    }

    if (user.mustChangePassword) {
      throw redirect({ to: "/change-password" });
    }

    throw redirect({
      to: sanitizeRedirectPath(search.redirect, "/panel"),
    });
  },
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
      await navigate({ to: sanitizeRedirectPath(redirect, "/panel") });
    } catch (error) {
      if (
        isApiClientError(error) &&
        error.apiError.code === ApiErrorCode.UNAUTHORIZED
      ) {
        setServerError(LL.externalPanel.login.invalidCredentials());
        return;
      }

      if (
        isApiClientError(error) &&
        error.apiError.code === ApiErrorCode.TOO_MANY_REQUESTS
      ) {
        setServerError(LL.externalPanel.login.tooManyAttempts());
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

        <div className="relative mt-2 flex items-center gap-3">
          <div
            aria-hidden
            className="h-px flex-1 bg-gradient-to-r from-transparent to-base-content/10"
          />
          <Link
            to="/"
            className={cn(
              "inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-2",
              "text-xs font-medium tracking-wide text-base-content/50",
              "transition-all hover:bg-base-content/5 hover:text-base-content/80",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40",
            )}
          >
            <ArrowLeft
              className={cn(iconSmClassName, "rtl:rotate-180")}
              strokeWidth={ICON_STROKE_WIDTH}
              aria-hidden
            />
            {LL.externalPanel.login.backToLanding()}
          </Link>
          <div
            aria-hidden
            className="h-px flex-1 bg-gradient-to-l from-transparent to-base-content/10"
          />
        </div>
      </Form>
    </AuthPageShell>
  );
}
