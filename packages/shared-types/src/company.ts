export type Company = {
  id: string;
  name: string;
  nationalId: string;
  phoneNumber: string;
  address: string | null;
  note: string | null;
};

export type CompanyInput = Omit<Company, "id">;
