import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CarTelemetryMarker } from './car-telemetry.types';
import { UserRole } from '@fuel-carrier/shared-types/user-role';
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
import { CarTelemetryMarkerDto } from '../swagger/dto/car-telemetry.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { CarTelemetryService } from './car-telemetry.service';

@ApiTags('car-telemetry')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard, MustChangePasswordGuard)
@Roles(UserRole.COMPANY_USER)
@Controller('external/car-telemetry')
export class ExternalCarTelemetryController {
  constructor(private readonly carTelemetryService: CarTelemetryService) {}

  @Get()
  @ApiOperation({
    summary: 'List latest car telemetry for the authenticated company',
  })
  @ApiEnvelopeOkListResponse(CarTelemetryMarkerDto)
  @ApiEnvelopeUnauthorizedResponse()
  list(@CurrentUser() user: AuthSession): Promise<CarTelemetryMarker[]> {
    return this.carTelemetryService.listMarkers(tenantContextFromSession(user));
  }
}
