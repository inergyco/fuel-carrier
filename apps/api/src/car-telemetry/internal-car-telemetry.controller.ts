import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@fuel-carrier/shared-types/user-role';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  ApiEnvelopeOkListResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import { CarTelemetryMarkerDto } from '../swagger/dto/car-telemetry.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { CarTelemetryService } from './car-telemetry.service';
import type { CarTelemetryMarker } from './car-telemetry.types';

@ApiTags('car-telemetry')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INTERNAL_ADMIN)
@Controller('internal/car-telemetry')
export class InternalCarTelemetryController {
  constructor(private readonly carTelemetryService: CarTelemetryService) {}

  @Get()
  @ApiOperation({
    summary: 'List latest car telemetry across every company',
  })
  @ApiEnvelopeOkListResponse(CarTelemetryMarkerDto)
  @ApiEnvelopeUnauthorizedResponse()
  list(): Promise<CarTelemetryMarker[]> {
    return this.carTelemetryService.listAllMarkers();
  }
}
