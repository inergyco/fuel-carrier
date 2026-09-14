import type { Car } from './car';

export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  companyId: string;
  /** ISO-8601 timestamptz from the API. */
  createdAt: string;
  /** ISO-8601 timestamptz from the API. */
  updatedAt: string;
  car?: Car | null;
};

export type DriverInput = Omit<Driver, 'id' | 'createdAt' | 'updatedAt' | 'car'>;
