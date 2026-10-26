import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AuthenticatedShell } from "../components/AuthenticatedShell";
import { authKeys, fetchMe } from "../lib/api/auth";
import { sanitizeRedirectPath } from "@fuel-carrier/web-ui/utils";

export const Route = createFileRoute("/panel")({
  beforeLoad: async ({ context, location }) => {
    let user;
    try {
      user = await context.queryClient.fetchQuery({
        queryKey: authKeys.me,
        queryFn: fetchMe,
        staleTime: 60_000,
      });
    } catch {
      throw redirect({
        to: "/login",
        search: {
          redirect: sanitizeRedirectPath(location.href, "/panel"),
        },
      });
    }

    if (user.mustChangePassword) {
      throw redirect({ to: "/change-password" });
    }

    return { user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();

  return (
    <AuthenticatedShell user={user}>
      <Outlet />
    </AuthenticatedShell>
  );
}
