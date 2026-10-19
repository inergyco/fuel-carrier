export type Company = {
  id: string;
  name: string;
  nationalId: string;
  phoneNumber: string;
  address: string | null;
  note: string | null;
  logoUrl: string | null;
  /** Price of petrol per liter; null when pricing is not configured. */
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

/** Counts that soft-delete with the company. */
export type CompanyDeletionImpact = {
  cars: number;
  drivers: number;
  users: number;
};

export type CompanyInput = Omit<
  Company,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

/** Pricing fields only — used by external company-admin PATCH. */
export type CompanyPricingInput = Pick<
  Company,
  | 'petrolPricePerLiter'
  | 'feeThresholdX'
  | 'feeThresholdY'
  | 'feeThresholdZ'
  | 'feeUpToX'
  | 'feeXToY'
  | 'feeYToZ'
  | 'feeAboveZ'
>;
