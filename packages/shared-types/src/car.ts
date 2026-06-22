export type Car = {
  id: string;
  name: string | null;
  licensePlate: string;
  companyId: string;
  driverId: string | null;
  note: string | null;
};

export type CarInput = Omit<Car, 'id'>;
