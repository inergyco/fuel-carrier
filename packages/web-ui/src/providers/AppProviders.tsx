import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, type RegisteredRouter } from "@tanstack/react-router";
import { queryClient } from "../query-client";
import { ToastProvider } from "../ui/toast";
import { I18nProvider } from "./I18nProvider";

type AppProvidersProps = {
  router: RegisteredRouter;
  localeStorageKey?: string;
};

export function AppProviders({ router, localeStorageKey }: AppProvidersProps) {
  return (
    <I18nProvider localeStorageKey={localeStorageKey}>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
      </ToastProvider>
    </I18nProvider>
  );
}
