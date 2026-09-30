import { createExternalCarDtoSchema } from '@fuel-carrier/shared-validation/car/create'
import { z } from 'zod'

export const carCreateFormSchema = createExternalCarDtoSchema

export const carEditFormSchema = createExternalCarDtoSchema.omit({
  driverId: true,
})

export type CarFormInput =
  | z.input<typeof carCreateFormSchema>
  | z.input<typeof carEditFormSchema>
export type CarFormOutput =
  | z.output<typeof carCreateFormSchema>
  | z.output<typeof carEditFormSchema>

export type CarFormModalMode = 'create' | 'edit'
