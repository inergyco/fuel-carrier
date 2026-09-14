import type { EntityStatus } from './entity-status';

export type Car = {
  id: string;
  name: string | null;
  licensePlate: string;
  companyId: string;
  driverId: string | null;
  note: string | null;
  status: EntityStatus;
  /** ISO-8601 timestamptz from the API. */
  createdAt: string;
  /** ISO-8601 timestamptz from the API. */
  updatedAt: string;
};

export type CarInput = Omit<Car, 'id' | 'createdAt' | 'updatedAt'>;
