import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, type RegisteredRouter } from "@tanstack/react-router";
import { AuthSessionSync } from "../auth/AuthSessionSync";
import type { PanelId } from "../preferences/panel-storage-keys";
import { queryClient } from "../query-client";
import { ToastProvider } from "../ui/toast";
import { I18nProvider } from "./I18nProvider";

type AppProvidersProps = {
  router: RegisteredRouter;
  localeStorageKey?: string;
  panelId: PanelId;
};

export function AppProviders({
  router,
  localeStorageKey,
  panelId,
}: AppProvidersProps) {
  return (
    <I18nProvider localeStorageKey={localeStorageKey}>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <AuthSessionSync panelId={panelId} />
          <RouterProvider router={router} />
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
      </ToastProvider>
    </I18nProvider>
  );
}
