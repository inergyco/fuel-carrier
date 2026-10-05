import type { Company } from '@fuel-carrier/shared-types'
import { createContext, useContext } from 'react'

const ACTIVE_COMPANY_STORAGE_KEY =
  'fuel-carrier:internal-panel:active-company-id'

export type ActiveCompanyContextValue = {
  companyId: string | null
  setCompanyId: (companyId: string) => void
  companies: Company[]
  isLoading: boolean
  hasCompanies: boolean
}

export const ActiveCompanyContext =
  createContext<ActiveCompanyContextValue | null>(null)

export function useActiveCompany(): ActiveCompanyContextValue {
  const context = useContext(ActiveCompanyContext)
  if (!context) {
    throw new Error(
      'useActiveCompany must be used within ActiveCompanyProvider',
    )
  }
  return context
}

export function resolveActiveCompanyId({
  preferredCompanyId,
  companies,
  isLoading,
}: {
  preferredCompanyId: string | null
  companies: Company[]
  isLoading: boolean
}): string | null {
  if (isLoading) {
    return preferredCompanyId
  }

  if (companies.length === 0) {
    return null
  }

  const isPreferredValid =
    preferredCompanyId != null &&
    companies.some((company) => company.id === preferredCompanyId)

  if (isPreferredValid) {
    return preferredCompanyId
  }

  return companies[0].id
}

export function readStoredCompanyId(): string | null {
  try {
    const value = localStorage.getItem(ACTIVE_COMPANY_STORAGE_KEY)
    return value && value.length > 0 ? value : null
  } catch {
    return null
  }
}

export function writeStoredCompanyId(companyId: string) {
  try {
    localStorage.setItem(ACTIVE_COMPANY_STORAGE_KEY, companyId)
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function clearStoredCompanyId() {
  try {
    localStorage.removeItem(ACTIVE_COMPANY_STORAGE_KEY)
  } catch {
    // Ignore storage failures.
  }
}
