import {
  createCompanyDtoSchema,
  type CreateCompanyDto,
} from './create-company.dto';

export const updateCompanyDtoSchema = createCompanyDtoSchema;

export type UpdateCompanyDto = CreateCompanyDto;
