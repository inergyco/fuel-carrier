import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import type {
  AuthSession,
  Company,
  CompanyDeletionImpact,
  PaginatedResult,
} from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
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
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  companyListQuerySchema,
  type CompanyListQueryDto,
} from '../common/dto/company-list-query.dto';
import { parseZodDto } from '../common/validation/zod.utils';
import { internalTenantContext } from '../database/tenant-context.utils';
import {
  ApiEnvelopeBadRequestResponse,
  ApiEnvelopeNotFoundResponse,
  ApiEnvelopeOkPaginatedResponse,
  ApiEnvelopeOkResponse,
  ApiEnvelopeUnauthorizedResponse,
  ApiMultipartFileBody,
} from '../swagger/decorators/api-envelope.decorator';
import {
  CompanyDeletionImpactDto,
  CompanyDto,
  CompanyLogoUploadDto,
  CreateCompanyRequestDto,
  ReplaceCompanyLogoRequestDto,
  UpdateCompanyRequestDto,
} from '../swagger/dto/company.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { CompaniesService } from './companies.service';
import { readCompanyLogoUpload } from './read-company-logo-upload';
import { replaceCompanyLogoDtoSchema } from './replace-company-logo.dto';

@ApiTags('companies')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INTERNAL_ADMIN)
@Controller('internal/companies')
export class InternalCompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'List all companies' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiEnvelopeOkPaginatedResponse(CompanyDto)
  @ApiEnvelopeUnauthorizedResponse()
  list(
    @Query(new ZodValidationPipe(companyListQuerySchema))
    query: CompanyListQueryDto,
  ): Promise<PaginatedResult<Company>> {
    return this.companiesService.list(query);
  }

  @Get(':id/deletion-impact')
  @ApiOperation({
    summary: 'Counts that will cascade-delete with the company',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeOkResponse(CompanyDeletionImpactDto)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  getDeletionImpact(@Param('id') id: string): Promise<CompanyDeletionImpact> {
    return this.companiesService.getDeletionImpact(id);
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

  @Post('logo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload a company logo and return its public path' })
  @ApiMultipartFileBody()
  @ApiEnvelopeOkResponse(CompanyLogoUploadDto)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  async uploadLogo(
    @Req() request: FastifyRequest,
  ): Promise<CompanyLogoUploadDto> {
    const logoUrl = await readCompanyLogoUpload(request);
    return { logoUrl };
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

  @Patch(':id/logo')
  @ApiOperation({ summary: 'Replace a company logo' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: ReplaceCompanyLogoRequestDto })
  @ApiEnvelopeOkResponse(CompanyDto)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  replaceLogo(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<Company> {
    const { logoUrl } = parseZodDto(replaceCompanyLogoDtoSchema, body);
    return this.companiesService.replaceLogo(
      internalTenantContext(user),
      id,
      logoUrl,
    );
  }

  @Delete(':id/logo')
  @ApiOperation({ summary: 'Remove a company logo' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeOkResponse(CompanyDto)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  removeLogo(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<Company> {
    return this.companiesService.replaceLogo(
      internalTenantContext(user),
      id,
      null,
    );
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
