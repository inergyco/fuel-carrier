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
  /** Price of petrol per liter; null when this car has no pricing row. */
  petrolPricePerLiter: number | null;
  /** Liter breakpoint x for fee bands (0–x / x–y / y–z / above z). */
  feeThresholdX: number | null;
  feeThresholdY: number | null;
  feeThresholdZ: number | null;
  /** Fee for 0–x liters. */
  feeUpToX: number | null;
  /** Fee for x–y liters. */
  feeXToY: number | null;
  /** Fee for y–z liters. */
  feeYToZ: number | null;
  /** Fee for above z liters. */
  feeAboveZ: number | null;
  /** ISO-8601 timestamptz when soft-deleted; null while live. */
  deletedAt: string | null;
  /** ISO-8601 timestamptz from the API. */
  createdAt: string;
  /** ISO-8601 timestamptz from the API. */
  updatedAt: string;
};

/** Pricing fields stored on a `car_pricing` row owned by `carId`. */
export type CarPricing = Pick<
  Car,
  | 'petrolPricePerLiter'
  | 'feeThresholdX'
  | 'feeThresholdY'
  | 'feeThresholdZ'
  | 'feeUpToX'
  | 'feeXToY'
  | 'feeYToZ'
  | 'feeAboveZ'
>;

/** Create/update payload — deletedAt, driver summary, and pricing are server-managed. */
export type CarInput = Omit<
  Car,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'driver' | keyof CarPricing
>;
