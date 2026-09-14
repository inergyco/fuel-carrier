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
  /** ISO-8601 timestamptz from the API. */
  assignedAt: string;
  /** ISO-8601 timestamptz from the API, or null while open. */
  unassignedAt: string | null;
  assignedByUserId: string | null;
  driver: CarDriverAssignmentDriver | null;
  assignedBy: CarDriverAssignmentActor | null;
};
