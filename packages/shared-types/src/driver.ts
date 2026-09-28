import type { Car } from "./car";

export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  companyId: string;
  /** ISO-8601 timestamptz when soft-deleted; null while live. */
  deletedAt: string | null;
  /** ISO-8601 timestamptz from the API. */
  createdAt: string;
  /** ISO-8601 timestamptz from the API. */
  updatedAt: string;
  car?: Car | null;
};

/** Create/update payload — deletedAt is server-managed via DELETE. */
export type DriverInput = Omit<
  Driver,
  "id" | "createdAt" | "updatedAt" | "car" | "deletedAt"
>;
