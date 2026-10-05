import { fetchAllPaginated } from '@fuel-carrier/web-ui/api'
import { useQuery } from '@fuel-carrier/web-ui/query'
import { useMemo, useState, type ReactNode } from 'react'
import { companyKeys, fetchCompanies } from '../../lib/api/companies'
import {
  ActiveCompanyContext,
  type ActiveCompanyContextValue,
  clearStoredCompanyId,
  readStoredCompanyId,
  resolveActiveCompanyId,
  writeStoredCompanyId,
} from './activeCompanyContext'

type ActiveCompanyProviderProps = {
  children: ReactNode
}

export function ActiveCompanyProvider({
  children,
}: ActiveCompanyProviderProps) {
  const [preferredCompanyId, setPreferredCompanyId] = useState<string | null>(
    () => readStoredCompanyId(),
  )

  const companiesQuery = useQuery({
    queryKey: companyKeys.all,
    queryFn: () => fetchAllPaginated(fetchCompanies),
  })

  const companies = useMemo(
    () => companiesQuery.data ?? [],
    [companiesQuery.data],
  )
  const isLoading = companiesQuery.isLoading

  const companyId = resolveActiveCompanyId({
    preferredCompanyId,
    companies,
    isLoading,
  })

  // Keep preference aligned with the resolved id once the list is known.
  // Render-time setState is the React-recommended alternative to syncing in an effect.
  if (!isLoading && companyId !== preferredCompanyId) {
    setPreferredCompanyId(companyId)
    if (companyId) {
      writeStoredCompanyId(companyId)
    } else {
      clearStoredCompanyId()
    }
  }

  function setCompanyId(nextCompanyId: string) {
    setPreferredCompanyId(nextCompanyId)
    writeStoredCompanyId(nextCompanyId)
  }

  const value = useMemo<ActiveCompanyContextValue>(
    function createValue() {
      return {
        companyId,
        setCompanyId,
        companies,
        isLoading,
        hasCompanies: companies.length > 0,
      }
    },
    [companyId, companies, isLoading],
  )

  return (
    <ActiveCompanyContext.Provider value={value}>
      {children}
    </ActiveCompanyContext.Provider>
  )
}
