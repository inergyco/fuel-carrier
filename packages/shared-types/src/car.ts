/** Slim current-driver fields returned with a car (not the full Driver resource). */
export type CarDriverSummary = {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
};

export type Car = {
  id: string;
  name: string | null;
  licensePlate: string;
  companyId: string;
  driverId: string | null;
  /** Current assigned driver; null when unassigned or driver is soft-deleted. */
  driver: CarDriverSummary | null;
  /** True when the vehicle has high-grade petrol; false = normal. */
  hasHighGrade: boolean;
  note: string | null;
  /** ISO-8601 timestamptz when soft-deleted; null while live. */
  deletedAt: string | null;
  /** ISO-8601 timestamptz from the API. */
  createdAt: string;
  /** ISO-8601 timestamptz from the API. */
  updatedAt: string;
};

/** Create/update payload — deletedAt/driver summary are server-managed. */
export type CarInput = Omit<
  Car,
  "id" | "createdAt" | "updatedAt" | "deletedAt" | "driver"
>;
