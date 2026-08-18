import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  CarTelemetry,
  CarTelemetryMarker,
} from '@fuel-carrier/shared-types/car-telemetry';
import { UserRole } from '@fuel-carrier/shared-types/user-role';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { internalTenantContext } from '../database/tenant-context.utils';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  ApiEnvelopeOkListResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import {
  CarTelemetryDto,
  CarTelemetryMarkerDto,
} from '../swagger/dto/car-telemetry.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import {
  carTelemetryHistoryQuerySchema,
  type CarTelemetryHistoryQueryDto,
} from './car-telemetry-history-query.dto';
import { CarTelemetryService } from './car-telemetry.service';

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

  @Get('history')
  @ApiOperation({
    summary: 'List historical telemetry samples for one car',
  })
  @ApiEnvelopeOkListResponse(CarTelemetryDto)
  @ApiEnvelopeUnauthorizedResponse()
  listHistory(
    @Query(new ZodValidationPipe(carTelemetryHistoryQuerySchema))
    query: CarTelemetryHistoryQueryDto,
  ): Promise<CarTelemetry[]> {
    return this.carTelemetryService.listHistory(internalTenantContext(), {
      carId: query.carId,
      start: new Date(query.start),
      end: new Date(query.end),
    });
  }
}
