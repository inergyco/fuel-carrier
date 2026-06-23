import { createExternalDriverDtoSchema } from '@fuel-carrier/shared-validation/driver/create'
import { z } from 'zod'

export const driverFormSchema = createExternalDriverDtoSchema

export type DriverFormInput = z.input<typeof driverFormSchema>
export type DriverFormOutput = z.output<typeof driverFormSchema>

export type DriverFormModalMode = 'create' | 'edit'
