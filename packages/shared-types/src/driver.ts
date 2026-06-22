import type { Car } from './car';

export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  companyId: string;
  car?: Car | null;
};

export type DriverInput = Omit<Driver, 'id'>;
