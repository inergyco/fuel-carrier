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

export type CompanyInput = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>;
