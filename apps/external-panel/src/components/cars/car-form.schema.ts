import { createExternalCarDtoSchema } from '@fuel-carrier/shared-validation/car/create'
import { z } from 'zod'

export const carFormSchema = createExternalCarDtoSchema.extend({
  driverId: z
    .union([z.literal(''), z.uuid()])
    .transform(function normalizeDriverId(value) {
      return value || null
    }),
})

export type CarFormInput = z.input<typeof carFormSchema>
export type CarFormOutput = z.output<typeof carFormSchema>

export type CarFormModalMode = 'create' | 'edit'
