/** Slim current-driver fields returned with a car (not the full Driver resource). */
export type CarDriverSummary = {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  imageUrl: string | null;
};

export type Car = {
  id: string;
  licensePlate: string;
  companyId: string;
  driverId: string | null;
  /** Current assigned driver; null when unassigned or driver is soft-deleted. */
  driver: CarDriverSummary | null;
  /** True when the vehicle has high-grade petrol; false = normal. */
  hasHighGrade: boolean;
  /** Integer compartment count: 1 or 3. Every tank shares `tankCapacityLiters`. */
  tankCount: number;
  /** Liters per tank. */
  tankCapacityLiters: number;
  /**
   * Human-readable company code for truck firmware (`company.id` in MQTT JSON).
   * Not the DB company UUID.
   */
  firmwareCompanyId: string | null;
  /**
   * Human-readable device code for truck firmware (`device.deviceId` in MQTT JSON).
   * Not the car UUID used in MQTT topics.
   */
  firmwareDeviceId: string | null;
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
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'driver'
>;
