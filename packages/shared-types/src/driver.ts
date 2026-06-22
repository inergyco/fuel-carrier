export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  companyId: string;
};

export type DriverInput = Omit<Driver, 'id'>;
