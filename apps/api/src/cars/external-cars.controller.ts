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
import type { Car } from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
import {
  createExternalCarDtoSchema,
  type CreateExternalCarDto,
  updateExternalCarDtoSchema,
  type UpdateExternalCarDto,
} from '@fuel-carrier/shared-validation/car/create';
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
import { CarsService } from './cars.service';

@ApiTags('cars')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COMPANY_USER)
@Controller('external/cars')
export class ExternalCarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  @ApiOperation({ summary: 'List cars for the authenticated company' })
  @ApiEnvelopeOkListResponse(Object)
  @ApiEnvelopeUnauthorizedResponse()
  list(@CurrentUser() user: AuthSession): Promise<Car[]> {
    return this.carsService.list(tenantContextFromSession(user));
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

  @Post()
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
  @ApiOperation({ summary: 'Update a car belonging to the authenticated company' })
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
  @ApiOperation({ summary: 'Delete a car belonging to the authenticated company' })
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
