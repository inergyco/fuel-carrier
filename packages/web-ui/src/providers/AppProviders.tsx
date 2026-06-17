import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  RouterProvider,
  type RegisteredRouter,
} from '@tanstack/react-router'
import { queryClient } from '../query-client'
import { I18nProvider } from './I18nProvider'

type AppProvidersProps = {
  router: RegisteredRouter
}

export function AppProviders({ router }: AppProvidersProps) {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </I18nProvider>
  )
}
