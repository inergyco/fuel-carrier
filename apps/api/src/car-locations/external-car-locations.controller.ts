import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CarLocationMarker } from '@fuel-carrier/shared-types/car-location';
import { UserRole } from '@fuel-carrier/shared-types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MustChangePasswordGuard } from '../auth/must-change-password.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthSession } from '../auth/auth.types';
import { tenantContextFromSession } from '../database/tenant-context.utils';
import {
  ApiEnvelopeOkListResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import { CarLocationMarkerDto } from '../swagger/dto/car-location.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { CarLocationsService } from './car-locations.service';

@ApiTags('car-locations')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard, MustChangePasswordGuard)
@Roles(UserRole.COMPANY_USER)
@Controller('external/car-locations')
export class ExternalCarLocationsController {
  constructor(private readonly carLocationsService: CarLocationsService) {}

  @Get()
  @ApiOperation({
    summary: 'List latest car locations for the authenticated company',
  })
  @ApiEnvelopeOkListResponse(CarLocationMarkerDto)
  @ApiEnvelopeUnauthorizedResponse()
  list(@CurrentUser() user: AuthSession): Promise<CarLocationMarker[]> {
    return this.carLocationsService.listMarkers(tenantContextFromSession(user));
  }
}
