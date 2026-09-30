import type { Car, FuelLevelFilter } from '@fuel-carrier/shared-types';

export type CreateCarPayload = {
  name?: string | null;
  licensePlate: string;
  companyId: string;
  driverId: string;
  hasHighGrade?: boolean;
  note?: string | null;
};

export type UpdateCarPayload = Partial<Omit<CreateCarPayload, 'driverId'>> & {
  driverId?: string;
  expectedDriverId?: string | null;
};

export type ListCarsOptions = {
  page: number;
  limit: number;
  search?: string;
  fuelGrade?: 'all' | 'highGrade' | 'normal';
  fuelLevel?: FuelLevelFilter;
  companyId?: string;
};

export const CAR_AUDIT_FIELDS = [
  'name',
  'licensePlate',
  'driverId',
  'hasHighGrade',
  'note',
] as const satisfies readonly (keyof Car)[];
