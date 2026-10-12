import {
  createCompanyUserFormSchemas,
  type CompanyUserValidationMessages,
} from '@fuel-carrier/shared-validation/company-user/create'
import { z } from 'zod'

export function createCompanyUserFormSchemaPair(
  messages: CompanyUserValidationMessages,
) {
  return createCompanyUserFormSchemas(messages)
}

type CompanyUserFormSchemas = ReturnType<typeof createCompanyUserFormSchemas>

export type CompanyUserFormInput = z.input<CompanyUserFormSchemas['createSchema']>
export type CompanyUserFormOutput = z.output<
  CompanyUserFormSchemas['createSchema']
>

export type CompanyUserFormModalMode = 'create' | 'edit'
