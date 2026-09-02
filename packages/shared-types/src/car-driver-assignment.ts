export type CarDriverAssignmentActor = {
  firstName: string;
  lastName: string;
};

export type CarDriverAssignmentDriver = {
  firstName: string;
  lastName: string;
};

export type CarDriverAssignment = {
  id: string;
  carId: string | null;
  driverId: string | null;
  companyId: string | null;
  assignedAt: Date;
  unassignedAt: Date | null;
  assignedByUserId: string | null;
  driver: CarDriverAssignmentDriver | null;
  assignedBy: CarDriverAssignmentActor | null;
};
