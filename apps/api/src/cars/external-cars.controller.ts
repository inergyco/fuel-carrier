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
import type {
  Car,
  CarDriverAssignment,
  CarMqttCredentials,
  PaginatedResult,
} from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
import {
  createExternalCarDtoSchema,
  type CreateExternalCarDto,
  updateExternalCarDtoSchema,
  type UpdateExternalCarDto,
} from '@fuel-carrier/shared-validation/car/create';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MustChangePasswordGuard } from '../auth/must-change-password.guard';
import { CompanyUserAdminGuard } from '../auth/company-user-admin.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthSession } from '../auth/auth.types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  paginationQuerySchema,
  type PaginationQueryDto,
} from '../common/dto/pagination-query.dto';
import { tenantContextFromSession } from '../database/tenant-context.utils';
import { MqttCredentialsService } from '../mqtt/mqtt-credentials.service';
import {
  ApiEnvelopeBadRequestResponse,
  ApiEnvelopeNotFoundResponse,
  ApiEnvelopeOkListResponse,
  ApiEnvelopeOkPaginatedResponse,
  ApiEnvelopeOkResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import { CarDriverAssignmentDto } from '../swagger/dto/car-driver-assignment.dto';
import { CarMqttCredentialsDto } from '../swagger/dto/car-mqtt-credentials.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { CarDriverAssignmentsService } from './car-driver-assignments.service';
import { CarsService } from './cars.service';

@ApiTags('cars')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard, MustChangePasswordGuard)
@Roles(UserRole.COMPANY_USER)
@Controller('external/cars')
export class ExternalCarsController {
  constructor(
    private readonly carsService: CarsService,
    private readonly carDriverAssignmentsService: CarDriverAssignmentsService,
    private readonly mqttCredentialsService: MqttCredentialsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List cars for the authenticated company' })
  @ApiEnvelopeOkListResponse(Object)
  @ApiEnvelopeUnauthorizedResponse()
  list(@CurrentUser() user: AuthSession): Promise<Car[]> {
    return this.carsService.list(tenantContextFromSession(user));
  }

  @Get(':id/driver-assignments')
  @ApiOperation({
    summary: 'List driver custody history for a company car',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiEnvelopeOkPaginatedResponse(CarDriverAssignmentDto)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  listDriverAssignments(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Query(new ZodValidationPipe(paginationQuerySchema))
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<CarDriverAssignment>> {
    return this.carDriverAssignmentsService.listByCar(
      tenantContextFromSession(user),
      id,
      query,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a car belonging to the authenticated company' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  getById(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<Car> {
    return this.carsService.getById(tenantContextFromSession(user), id);
  }

  @Post(':id/mqtt-credentials')
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({
    summary:
      'Provision or rotate MQTT credentials for a company car (plaintext password returned once)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeOkResponse(CarMqttCredentialsDto)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  provisionMqttCredentials(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<CarMqttCredentials> {
    return this.mqttCredentialsService.provisionForCar(
      tenantContextFromSession(user),
      id,
    );
  }

  @Post()
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({ summary: 'Create a car for the authenticated company' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  create(
    @CurrentUser() user: AuthSession,
    @Body(new ZodValidationPipe(createExternalCarDtoSchema))
    dto: CreateExternalCarDto,
  ): Promise<Car> {
    return this.carsService.create(tenantContextFromSession(user), {
      ...dto,
      companyId: user.companyId!,
    });
  }

  @Patch(':id')
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({
    summary: 'Update a car belonging to the authenticated company',
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
    @Body(new ZodValidationPipe(updateExternalCarDtoSchema))
    dto: UpdateExternalCarDto,
  ): Promise<Car> {
    return this.carsService.update(tenantContextFromSession(user), id, dto);
  }

  @Delete(':id')
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({
    summary: 'Delete a car belonging to the authenticated company',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  delete(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<null> {
    return this.carsService.delete(tenantContextFromSession(user), id);
  }
}
