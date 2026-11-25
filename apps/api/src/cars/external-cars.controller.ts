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
  CarFleetStats,
  CarMqttCredentials,
  CarOutputCommandResult,
  PaginatedResult,
} from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
import {
  createExternalCarDtoSchema,
  type CreateExternalCarDto,
  updateExternalCarDtoSchema,
  type UpdateExternalCarDto,
} from '@fuel-carrier/shared-validation/car/create';
import {
  updateCarPricingDtoSchema,
  type UpdateCarPricingDto,
} from '@fuel-carrier/shared-validation/car/pricing';
import {
  carOutputCommandDtoSchema,
  type CarOutputCommandDto,
} from '@fuel-carrier/shared-validation/car/output-command';
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
import {
  resourceListQuerySchema,
  type ResourceListQueryDto,
} from '../common/dto/resource-list-query.dto';
import { tenantContextFromSession } from '../database/tenant-context.utils';
import { MqttCredentialsService } from '../mqtt/mqtt-credentials.service';
import { MqttOutputCommandService } from '../mqtt/mqtt-output-command.service';
import {
  ApiEnvelopeBadRequestResponse,
  ApiEnvelopeNotFoundResponse,
  ApiEnvelopeOkPaginatedResponse,
  ApiEnvelopeOkResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import { CarDriverAssignmentDto } from '../swagger/dto/car-driver-assignment.dto';
import { CarFleetStatsDto } from '../swagger/dto/car-fleet-stats.dto';
import { CarMqttCredentialsDto } from '../swagger/dto/car-mqtt-credentials.dto';
import {
  CarOutputCommandRequestDto,
  CarOutputCommandResultDto,
} from '../swagger/dto/car-output-command.dto';
import { UpdateCarPricingRequestDto } from '../swagger/dto/car-pricing.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { redactFirmwareIdentity } from './cars-reader.service';
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
    private readonly mqttOutputCommandService: MqttOutputCommandService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List cars for the authenticated company' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'fuelGrade',
    required: false,
    enum: ['all', 'highGrade', 'normal'],
  })
  @ApiQuery({
    name: 'fuelLevel',
    required: false,
    enum: ['all', 'high', 'midHigh', 'midLow', 'low'],
  })
  @ApiEnvelopeOkPaginatedResponse(Object)
  @ApiEnvelopeUnauthorizedResponse()
  async list(
    @CurrentUser() user: AuthSession,
    @Query(new ZodValidationPipe(resourceListQuerySchema))
    query: ResourceListQueryDto,
  ): Promise<PaginatedResult<Car>> {
    const result = await this.carsService.list(
      tenantContextFromSession(user),
      query,
    );
    return {
      ...result,
      items: result.items.map(redactFirmwareIdentity),
    };
  }

  @Get('stats')
  @ApiOperation({
    summary:
      'Fleet KPI stats for the authenticated company (totals, fuel bands, high-grade)',
  })
  @ApiEnvelopeOkResponse(CarFleetStatsDto)
  @ApiEnvelopeUnauthorizedResponse()
  getFleetStats(@CurrentUser() user: AuthSession): Promise<CarFleetStats> {
    return this.carsService.getFleetStats(tenantContextFromSession(user));
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
  async getById(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<Car> {
    const car = await this.carsService.getById(
      tenantContextFromSession(user),
      id,
    );
    return redactFirmwareIdentity(car);
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

  @Post(':id/outputs')
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({
    summary:
      'Enable or disable truck GPIO outputs (fuel system) via MQTT and wait for device ACK',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: CarOutputCommandRequestDto })
  @ApiEnvelopeOkResponse(CarOutputCommandResultDto)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  sendOutputCommand(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(carOutputCommandDtoSchema))
    dto: CarOutputCommandDto,
  ): Promise<CarOutputCommandResult> {
    return this.mqttOutputCommandService.sendOutputCommand(
      tenantContextFromSession(user),
      id,
      dto.action,
    );
  }

  @Post()
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({ summary: 'Create a car for the authenticated company' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  async create(
    @CurrentUser() user: AuthSession,
    @Body(new ZodValidationPipe(createExternalCarDtoSchema))
    dto: CreateExternalCarDto,
  ): Promise<Car> {
    const car = await this.carsService.create(tenantContextFromSession(user), {
      ...dto,
      companyId: user.companyId!,
    });
    return redactFirmwareIdentity(car);
  }

  @Patch(':id/pricing')
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({
    summary:
      'Save petrol price and fee ranges for a company car and program them on the truck',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateCarPricingRequestDto })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  async updatePricing(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCarPricingDtoSchema))
    dto: UpdateCarPricingDto,
  ): Promise<Car> {
    const car = await this.carsService.updatePricing(
      tenantContextFromSession(user),
      id,
      dto,
    );
    return redactFirmwareIdentity(car);
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
  async update(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateExternalCarDtoSchema))
    dto: UpdateExternalCarDto,
  ): Promise<Car> {
    const car = await this.carsService.update(
      tenantContextFromSession(user),
      id,
      dto,
    );
    return redactFirmwareIdentity(car);
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
