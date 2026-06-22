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
import type { Driver } from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
import {
  createExternalDriverDtoSchema,
  type CreateExternalDriverDto,
  updateExternalDriverDtoSchema,
  type UpdateExternalDriverDto,
} from '@fuel-carrier/shared-validation/driver/create';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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
import { DriversService } from './drivers.service';

@ApiTags('drivers')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COMPANY_USER)
@Controller('external/drivers')
export class ExternalDriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @ApiOperation({ summary: 'List drivers for the authenticated company' })
  @ApiEnvelopeOkListResponse(Object)
  @ApiEnvelopeUnauthorizedResponse()
  list(@CurrentUser() user: AuthSession): Promise<Driver[]> {
    return this.driversService.list(tenantContextFromSession(user));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a driver belonging to the authenticated company',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  getById(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<Driver> {
    return this.driversService.getById(tenantContextFromSession(user), id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a driver for the authenticated company' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  create(
    @CurrentUser() user: AuthSession,
    @Body(new ZodValidationPipe(createExternalDriverDtoSchema))
    dto: CreateExternalDriverDto,
  ): Promise<Driver> {
    return this.driversService.create(tenantContextFromSession(user), {
      ...dto,
      companyId: user.companyId!,
    });
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a driver belonging to the authenticated company',
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
    @Body(new ZodValidationPipe(updateExternalDriverDtoSchema))
    dto: UpdateExternalDriverDto,
  ): Promise<Driver> {
    return this.driversService.update(tenantContextFromSession(user), id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a driver belonging to the authenticated company',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  delete(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<null> {
    return this.driversService.delete(tenantContextFromSession(user), id);
  }
}
