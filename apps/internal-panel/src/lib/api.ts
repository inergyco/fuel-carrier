import { createApiClient } from '@fuel-carrier/web-ui/api'

export const api = createApiClient({
  prefixUrl: import.meta.env.VITE_API_URL,
})
