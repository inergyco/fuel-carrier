export type Car = {
  id: string;
  name: string | null;
  licensePlate: string;
  companyId: string;
  driverId: string | null;
  note: string | null;
  /** ISO-8601 timestamptz when soft-deleted; null while live. */
  deletedAt: string | null;
  /** ISO-8601 timestamptz from the API. */
  createdAt: string;
  /** ISO-8601 timestamptz from the API. */
  updatedAt: string;
};

/** Create/update payload — deletedAt is server-managed via DELETE. */
export type CarInput = Omit<
  Car,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;
