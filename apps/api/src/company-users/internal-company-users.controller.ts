import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import type { AuthSession, CompanyUser } from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
import {
  createInternalCompanyUserDtoSchema,
  type CreateInternalCompanyUserDto,
  updateInternalCompanyUserDtoSchema,
  type UpdateInternalCompanyUserDto,
} from '@fuel-carrier/shared-validation/company-user/create';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { internalTenantContext } from '../database/tenant-context.utils';
import {
  ApiEnvelopeBadRequestResponse,
  ApiEnvelopeNotFoundResponse,
  ApiEnvelopeOkListResponse,
  ApiEnvelopeOkResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { CompanyUsersService } from './company-users.service';

@ApiTags('company-users')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INTERNAL_ADMIN)
@Controller('internal/company-users')
export class InternalCompanyUsersController {
  constructor(private readonly companyUsersService: CompanyUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List company users for a company' })
  @ApiQuery({ name: 'companyId', format: 'uuid', required: true })
  @ApiEnvelopeOkListResponse(Object)
  @ApiEnvelopeUnauthorizedResponse()
  list(@Query('companyId') companyId: string): Promise<CompanyUser[]> {
    return this.companyUsersService.list(internalTenantContext(), companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company user by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  getById(@Param('id') id: string): Promise<CompanyUser> {
    return this.companyUsersService.getById(internalTenantContext(), id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a company user' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  create(
    @CurrentUser() user: AuthSession,
    @Body(new ZodValidationPipe(createInternalCompanyUserDtoSchema))
    dto: CreateInternalCompanyUserDto,
  ): Promise<CompanyUser> {
    return this.companyUsersService.create(internalTenantContext(user), dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a company user' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  update(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateInternalCompanyUserDtoSchema))
    dto: UpdateInternalCompanyUserDto,
  ): Promise<CompanyUser> {
    return this.companyUsersService.update(
      internalTenantContext(user),
      id,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company user' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  delete(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<null> {
    return this.companyUsersService.delete(internalTenantContext(user), id);
  }
}
