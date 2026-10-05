import type { Company } from '@fuel-carrier/shared-types'
import { ApiErrorCode } from '@fuel-carrier/shared-types'
import { isApiClientError } from '@fuel-carrier/web-ui/api'
import { useQuery } from '@fuel-carrier/web-ui/query'
import { companyKeys, fetchCompany } from '../../lib/api/companies'

export function useCompanyQuery(
  companyId: string,
  options?: { enabled?: boolean },
) {
  const companyQuery = useQuery<Company>({
    queryKey: companyKeys.detail(companyId),
    queryFn: function loadCompany() {
      return fetchCompany(companyId)
    },
    enabled: (options?.enabled ?? true) && Boolean(companyId),
  })

  const isNotFound =
    companyQuery.isError &&
    isApiClientError(companyQuery.error) &&
    companyQuery.error.apiError.code === ApiErrorCode.NOT_FOUND

  return {
    companyQuery,
    isNotFound,
  }
}
