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
import type { CompanyUser } from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
import {
  createExternalCompanyUserDtoSchema,
  type CreateExternalCompanyUserDto,
  updateExternalCompanyUserDtoSchema,
  type UpdateExternalCompanyUserDto,
} from '@fuel-carrier/shared-validation/company-user/create';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MustChangePasswordGuard } from '../auth/must-change-password.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthSession } from '../auth/auth.types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { tenantContextFromSession } from '../database/tenant-context.utils';
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
@UseGuards(JwtAuthGuard, RolesGuard, MustChangePasswordGuard)
@Roles(UserRole.COMPANY_USER)
@Controller('external/company-users')
export class ExternalCompanyUsersController {
  constructor(private readonly companyUsersService: CompanyUsersService) {}

  @Get()
  @ApiOperation({
    summary: 'List company users for the authenticated company',
  })
  @ApiEnvelopeOkListResponse(Object)
  @ApiEnvelopeUnauthorizedResponse()
  list(@CurrentUser() user: AuthSession): Promise<CompanyUser[]> {
    return this.companyUsersService.list(
      tenantContextFromSession(user),
      user.companyId!,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a company user belonging to the authenticated company',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  getById(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<CompanyUser> {
    return this.companyUsersService.getById(tenantContextFromSession(user), id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a company user for the authenticated company',
  })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  create(
    @CurrentUser() user: AuthSession,
    @Body(new ZodValidationPipe(createExternalCompanyUserDtoSchema))
    dto: CreateExternalCompanyUserDto,
  ): Promise<CompanyUser> {
    return this.companyUsersService.create(tenantContextFromSession(user), {
      ...dto,
      companyId: user.companyId!,
    });
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a company user belonging to the authenticated company',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  update(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateExternalCompanyUserDtoSchema))
    dto: UpdateExternalCompanyUserDto,
  ): Promise<CompanyUser> {
    return this.companyUsersService.update(
      tenantContextFromSession(user),
      id,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a company user belonging to the authenticated company',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  delete(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<null> {
    return this.companyUsersService.delete(tenantContextFromSession(user), id);
  }
}
