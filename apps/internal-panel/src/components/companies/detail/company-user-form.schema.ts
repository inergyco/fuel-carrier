import { createCompanyUserDtoSchema } from '@fuel-carrier/shared-validation/company-user/create'
import { strongPasswordSchema } from '@fuel-carrier/shared-validation/password'
import { z } from 'zod'

export const companyUserCreateFormSchema = createCompanyUserDtoSchema.omit({
  companyId: true,
})

export const companyUserEditFormSchema = companyUserCreateFormSchema.extend({
  password: z.union([z.literal(''), strongPasswordSchema]),
})

export type CompanyUserFormInput = z.input<typeof companyUserCreateFormSchema>
export type CompanyUserFormOutput = z.output<typeof companyUserCreateFormSchema>

export type CompanyUserFormModalMode = 'create' | 'edit'
