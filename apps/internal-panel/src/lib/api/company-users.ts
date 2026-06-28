import type { CompanyUser } from '@fuel-carrier/shared-types'
import type {
  CreateInternalCompanyUserDto,
  UpdateInternalCompanyUserDto,
} from '@fuel-carrier/shared-validation/company-user/create'
import { api } from './api'

export const companyUserKeys = {
  byCompany: (companyId: string) => ['company-users', companyId] as const,
}

export type CompanyUserFormValues = {
  firstName: string
  lastName: string
  username: string
  password: string
  nationalId: string
  email: string
}

export function companyUserToFormValues(
  user?: CompanyUser,
): CompanyUserFormValues {
  return {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    username: user?.username ?? '',
    password: '',
    nationalId: user?.nationalId ?? '',
    email: user?.email ?? '',
  }
}

export async function fetchCompanyUsers(
  companyId: string,
): Promise<CompanyUser[]> {
  return api
    .get('company-users', { searchParams: { companyId } })
    .json<CompanyUser[]>()
}

export async function createCompanyUser(
  dto: CreateInternalCompanyUserDto,
): Promise<CompanyUser> {
  return api.post('company-users', { json: dto }).json<CompanyUser>()
}

export async function updateCompanyUser(
  id: string,
  dto: UpdateInternalCompanyUserDto,
): Promise<CompanyUser> {
  return api.patch(`company-users/${id}`, { json: dto }).json<CompanyUser>()
}

export async function deleteCompanyUser(id: string): Promise<void> {
  await api.delete(`company-users/${id}`).json()
}
