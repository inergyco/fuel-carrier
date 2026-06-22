export type CompanyUser = {
  id: string;
  userId: string;
  companyId: string;
  username: string;
  firstName: string;
  lastName: string;
  nationalId: string | null;
  email: string | null;
};

export type CompanyUserInput = {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  companyId: string;
  nationalId?: string | null;
  email?: string | null;
};
