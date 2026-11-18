import { CarOutputActions } from '@fuel-carrier/shared-types';
import { z } from 'zod';

export const carOutputCommandDtoSchema = z.object({
  action: z.enum([CarOutputActions.ENABLE, CarOutputActions.DISABLE]),
});

export type CarOutputCommandDto = z.infer<typeof carOutputCommandDtoSchema>;
