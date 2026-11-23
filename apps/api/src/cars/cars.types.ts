import type { Car, FuelLevelFilter } from '@fuel-carrier/shared-types';

export type CreateCarPayload = {
  licensePlate: string;
  companyId: string;
  driverId: string;
  hasHighGrade?: boolean;
  tankCount?: number;
  tankCapacityLiters?: number;
  firmwareCompanyId?: string | null;
  firmwareDeviceId?: string | null;
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
  'licensePlate',
  'driverId',
  'hasHighGrade',
  'tankCount',
  'tankCapacityLiters',
  'firmwareCompanyId',
  'firmwareDeviceId',
  'note',
  'petrolPricePerLiter',
  'feeThresholdX',
  'feeThresholdY',
  'feeThresholdZ',
  'feeUpToX',
  'feeXToY',
  'feeYToZ',
  'feeAboveZ',
] as const satisfies readonly (keyof Car)[];
