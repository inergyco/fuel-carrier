import type {
  CompanyUser,
  PaginatedResult,
  PaginationParams,
} from '@fuel-carrier/shared-types'
import { CompanyUserLevels, DEFAULT_LIMIT } from '@fuel-carrier/shared-types'
import type {
  CreateExternalCompanyUserDto,
  UpdateExternalCompanyUserDto,
} from '@fuel-carrier/shared-validation/company-user/create'
import { api } from '@fuel-carrier/web-ui/api'

export const companyUserKeys = {
  all: ['company-users'] as const,
  list: (params: PaginationParams = { page: 1, limit: DEFAULT_LIMIT }) =>
    ['company-users', 'list', params] as const,
}

export type CompanyUserFormValues = {
  firstName: string
  lastName: string
  username: string
  password: string
  nationalId: string
  email: string
  level: CompanyUser['level']
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
    level: user?.level ?? CompanyUserLevels.VIEWER,
  }
}

export async function fetchCompanyUsers(
  params: PaginationParams = { page: 1, limit: DEFAULT_LIMIT },
): Promise<PaginatedResult<CompanyUser>> {
  return api
    .get('company-users', { searchParams: params })
    .json<PaginatedResult<CompanyUser>>()
}

export async function createCompanyUser(
  dto: CreateExternalCompanyUserDto,
): Promise<CompanyUser> {
  return api.post('company-users', { json: dto }).json<CompanyUser>()
}

export async function updateCompanyUser(
  id: string,
  dto: UpdateExternalCompanyUserDto,
): Promise<CompanyUser> {
  return api.patch(`company-users/${id}`, { json: dto }).json<CompanyUser>()
}

export async function deleteCompanyUser(id: string): Promise<void> {
  await api.delete(`company-users/${id}`).json()
}
