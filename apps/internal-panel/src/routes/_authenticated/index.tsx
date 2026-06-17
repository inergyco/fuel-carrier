import {
  createFileRoute,
  getRouteApi,
  useNavigate,
} from "@tanstack/react-router";
import { useQueryClient } from "@fuel-carrier/web-ui/query";
import { ThemeToggle } from "@fuel-carrier/web-ui/ui";
import { useState } from "react";
import { authKeys, logout } from "../../lib/auth";

const authenticatedRoute = getRouteApi("/_authenticated");

export const Route = createFileRoute("/_authenticated/")({
  component: HomePage,
});

function HomePage() {
  const { user } = authenticatedRoute.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      queryClient.removeQueries({ queryKey: authKeys.me });
      await navigate({ to: "/login", search: { redirect: location.href } });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-4 p-8">
      <ThemeToggle className="absolute top-4 right-4" />
      <h1 className="text-3xl font-bold">Internal Panel</h1>
      <p className="text-base-content/70">
        Signed in as {user.firstName} {user.lastName} ({user.username})
      </p>
      <button
        type="button"
        className="btn btn-outline"
        disabled={isLoggingOut}
        onClick={handleLogout}
      >
        {isLoggingOut ? "Signing out…" : "Sign out"}
      </button>
    </main>
  );
}
