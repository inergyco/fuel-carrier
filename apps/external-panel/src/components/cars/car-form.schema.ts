import {
  createCarFormSchemas,
  type CarValidationMessages,
} from '@fuel-carrier/shared-validation/car/create'
import { z } from 'zod'

export function createCarFormSchemaPair(messages: CarValidationMessages) {
  return createCarFormSchemas(messages)
}

type CarFormSchemas = ReturnType<typeof createCarFormSchemas>

export type CarFormInput =
  | z.input<CarFormSchemas['createSchema']>
  | z.input<CarFormSchemas['editSchema']>
export type CarFormOutput =
  | z.output<CarFormSchemas['createSchema']>
  | z.output<CarFormSchemas['editSchema']>

export type CarFormModalMode = 'create' | 'edit'
