import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import type { RouterContext } from "./context";

export function createPanelRootRoute() {
  return createRootRouteWithContext<RouterContext>()({
    component: RootLayout,
  });
}

function RootLayout() {
  return (
    <>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </>
  );
}
