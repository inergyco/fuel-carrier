import {
  POSTGRES_EXCLUSION_VIOLATION,
  POSTGRES_FOREIGN_KEY_VIOLATION,
  POSTGRES_UNIQUE_VIOLATION,
  type PostgresConstraintMapping,
} from '../database/postgres-error.utils';

export const CAR_POSTGRES_MAPPINGS: PostgresConstraintMapping[] = [
  {
    code: POSTGRES_UNIQUE_VIOLATION,
    constraint: 'cars_license_plate_unique',
    field: 'licensePlate',
    message: 'A car with this license plate already exists',
  },
  {
    code: POSTGRES_UNIQUE_VIOLATION,
    constraint: 'cars_driver_id_unique',
    field: 'driverId',
    message: 'This driver is already assigned to another vehicle',
  },
  {
    code: POSTGRES_UNIQUE_VIOLATION,
    constraint: 'car_driver_assignments_car_id_open_unique',
    field: 'driverId',
    message: 'This vehicle already has an active driver assignment',
  },
  {
    code: POSTGRES_UNIQUE_VIOLATION,
    constraint: 'car_driver_assignments_driver_id_open_unique',
    field: 'driverId',
    message: 'This driver already has an active vehicle assignment',
  },
  {
    code: POSTGRES_EXCLUSION_VIOLATION,
    constraint: 'car_driver_assignments_car_no_overlap',
    field: 'driverId',
    message: 'This vehicle already has an overlapping custody period',
  },
  {
    code: POSTGRES_EXCLUSION_VIOLATION,
    constraint: 'car_driver_assignments_driver_no_overlap',
    field: 'driverId',
    message: 'This driver already has an overlapping custody period',
  },
  {
    code: POSTGRES_FOREIGN_KEY_VIOLATION,
    constraint: 'cars_company_id_companies_id_fk',
    field: 'companyId',
    message: 'Company not found',
  },
  {
    code: POSTGRES_FOREIGN_KEY_VIOLATION,
    constraint: 'cars_driver_id_company_id_drivers_id_company_id_fk',
    field: 'driverId',
    message: 'Driver must belong to the same company as the car',
  },
];
