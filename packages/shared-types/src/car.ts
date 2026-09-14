export type Car = {
  id: string;
  name: string | null;
  licensePlate: string;
  companyId: string;
  driverId: string | null;
  note: string | null;
  /** ISO-8601 timestamptz from the API. */
  createdAt: string;
  /** ISO-8601 timestamptz from the API. */
  updatedAt: string;
};

export type CarInput = Omit<Car, 'id' | 'createdAt' | 'updatedAt'>;
