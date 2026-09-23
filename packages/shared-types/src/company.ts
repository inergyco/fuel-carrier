export type Company = {
  id: string;
  name: string;
  nationalId: string;
  phoneNumber: string;
  address: string | null;
  note: string | null;
  logoUrl: string | null;
  /** ISO-8601 timestamptz from the API. */
  createdAt: string;
  /** ISO-8601 timestamptz from the API. */
  updatedAt: string;
};

/** Counts that cascade-delete with the company. */
export type CompanyDeletionImpact = {
  cars: number;
  drivers: number;
  users: number;
};

export type CompanyInput = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>;
