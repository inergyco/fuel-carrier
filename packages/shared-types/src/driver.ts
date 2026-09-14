import type { Car } from './car';
import type { EntityStatus } from './entity-status';

export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  companyId: string;
  status: EntityStatus;
  /** ISO-8601 timestamptz from the API. */
  createdAt: string;
  /** ISO-8601 timestamptz from the API. */
  updatedAt: string;
  car?: Car | null;
};

export type DriverInput = Omit<Driver, 'id' | 'createdAt' | 'updatedAt' | 'car'>;
