import {
  POSTGRES_UNIQUE_VIOLATION,
  type PostgresConstraintMapping,
} from '../database/postgres-error.utils';

export const COMPANY_POSTGRES_MAPPINGS: PostgresConstraintMapping[] = [
  {
    code: POSTGRES_UNIQUE_VIOLATION,
    constraint: 'companies_national_id_unique',
    field: 'nationalId',
    message: 'A company with this national ID already exists',
  },
];
