import {
  createDriverBaseSchema,
  type DriverValidationMessages,
} from '@fuel-carrier/shared-validation/driver/create'
import { z } from 'zod'

export function createDriverFormSchema(messages: DriverValidationMessages) {
  return createDriverBaseSchema(messages)
}

type DriverFormSchema = ReturnType<typeof createDriverFormSchema>

export type DriverFormInput = z.input<DriverFormSchema>
export type DriverFormOutput = z.output<DriverFormSchema>

export type DriverFormModalMode = 'create' | 'edit'
