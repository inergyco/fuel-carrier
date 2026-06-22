export type CompanyUser = {
  id: string;
  userId: string;
  companyId: string;
  username: string;
  nationalId: string | null;
  email: string | null;
};

export type CompanyUserInput = {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  nationalId?: string | null;
  email?: string | null;
};
