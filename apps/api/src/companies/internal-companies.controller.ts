import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthSession, Company } from '@fuel-carrier/shared-types';
import {
  createCompanyDtoSchema,
  type CreateCompanyDto,
} from '@fuel-carrier/shared-validation/company/create';
import {
  updateCompanyDtoSchema,
  type UpdateCompanyDto,
} from '@fuel-carrier/shared-validation/company/update';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { internalTenantContext } from '../database/tenant-context.utils';
import {
  ApiEnvelopeBadRequestResponse,
  ApiEnvelopeNotFoundResponse,
  ApiEnvelopeOkListResponse,
  ApiEnvelopeOkResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import {
  CompanyDto,
  CreateCompanyRequestDto,
  UpdateCompanyRequestDto,
} from '../swagger/dto/company.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { CompaniesService } from './companies.service';

@ApiTags('companies')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard)
@Controller('internal/companies')
export class InternalCompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'List all companies' })
  @ApiEnvelopeOkListResponse(CompanyDto)
  @ApiEnvelopeUnauthorizedResponse()
  list(): Promise<Company[]> {
    return this.companiesService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeOkResponse(CompanyDto)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  getById(@Param('id') id: string): Promise<Company> {
    return this.companiesService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a company' })
  @ApiBody({ type: CreateCompanyRequestDto })
  @ApiEnvelopeOkResponse(CompanyDto)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  create(
    @CurrentUser() user: AuthSession,
    @Body(new ZodValidationPipe(createCompanyDtoSchema))
    dto: CreateCompanyDto,
  ): Promise<Company> {
    return this.companiesService.create(internalTenantContext(user), dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a company' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateCompanyRequestDto })
  @ApiEnvelopeOkResponse(CompanyDto)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  update(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCompanyDtoSchema))
    dto: UpdateCompanyDto,
  ): Promise<Company> {
    return this.companiesService.update(internalTenantContext(user), id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  delete(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<null> {
    return this.companiesService.delete(internalTenantContext(user), id);
  }
}
