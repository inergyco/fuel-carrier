import {
  createCarFormSchemas,
  type CarValidationMessages,
} from '@fuel-carrier/shared-validation/car/create'
import { z } from 'zod'

export const createCarFormSchemaPair = (messages: CarValidationMessages) =>
  createCarFormSchemas(messages)

type CarFormSchemas = ReturnType<typeof createCarFormSchemas>

export type CreateCarFormOutput = z.output<CarFormSchemas['createSchema']>
export type CarFormInput =
  | z.input<CarFormSchemas['createSchema']>
  | z.input<CarFormSchemas['editSchema']>
export type CarFormOutput =
  | CreateCarFormOutput
  | z.output<CarFormSchemas['editSchema']>

export type CarFormModalMode = 'create' | 'edit'
