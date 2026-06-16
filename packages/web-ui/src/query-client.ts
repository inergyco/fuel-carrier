import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 60_000 milliseconds is 1 minute
      staleTime: 60_000,
    },
  },
})
