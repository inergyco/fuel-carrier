import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  CarTelemetry,
  CarTelemetryMarker,
} from '@fuel-carrier/shared-types/car-telemetry';
import { UserRole } from '@fuel-carrier/shared-types/user-role';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MustChangePasswordGuard } from '../auth/must-change-password.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthSession } from '../auth/auth.types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { tenantContextFromSession } from '../database/tenant-context.utils';
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

  @Get('history')
  @ApiOperation({
    summary: 'List historical telemetry samples for one company car',
  })
  @ApiEnvelopeOkListResponse(CarTelemetryDto)
  @ApiEnvelopeUnauthorizedResponse()
  listHistory(
    @CurrentUser() user: AuthSession,
    @Query(new ZodValidationPipe(carTelemetryHistoryQuerySchema))
    query: CarTelemetryHistoryQueryDto,
  ): Promise<CarTelemetry[]> {
    return this.carTelemetryService.listHistory(
      tenantContextFromSession(user),
      {
        carId: query.carId,
        start: new Date(query.start),
        end: new Date(query.end),
      },
    );
  }
}
