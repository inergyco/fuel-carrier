import {
  POSTGRES_UNIQUE_VIOLATION,
  type PostgresConstraintMapping,
} from '../database/postgres-error.utils';

export const COMPANY_USER_POSTGRES_MAPPINGS: PostgresConstraintMapping[] = [
  {
    code: POSTGRES_UNIQUE_VIOLATION,
    constraint: 'company_users_username_unique',
    field: 'username',
    message: 'This username is already taken',
  },
  {
    code: POSTGRES_UNIQUE_VIOLATION,
    constraint: 'company_users_national_id_unique',
    field: 'nationalId',
    message: 'A user with this national ID already exists',
  },
];
