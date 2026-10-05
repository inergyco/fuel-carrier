import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
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
  AuthSession,
  Driver,
  PaginatedResult,
} from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
import {
  createInternalDriverDtoSchema,
  type CreateInternalDriverDto,
  updateInternalDriverDtoSchema,
  type UpdateInternalDriverDto,
} from '@fuel-carrier/shared-validation/driver/create';
import type { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  companyScopedListQuerySchema,
  type CompanyScopedListQueryDto,
} from '../common/dto/company-scoped-list-query.dto';
import { parseZodDto } from '../common/validation/zod.utils';
import { internalTenantContext } from '../database/tenant-context.utils';
import {
  ApiEnvelopeBadRequestResponse,
  ApiEnvelopeNotFoundResponse,
  ApiEnvelopeOkPaginatedResponse,
  ApiEnvelopeOkResponse,
  ApiEnvelopeUnauthorizedResponse,
  ApiMultipartFileBody,
} from '../swagger/decorators/api-envelope.decorator';
import {
  DriverDto,
  DriverImageUploadDto,
  ReplaceDriverImageRequestDto,
} from '../swagger/dto/driver.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { driverImageStorage } from '../uploads/image-storages';
import { readImageUpload } from '../uploads/read-image-upload';
import { DriversService } from './drivers.service';
import { replaceDriverImageDtoSchema } from './replace-driver-image.dto';

@ApiTags('drivers')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INTERNAL_ADMIN)
@Controller('internal/drivers')
export class InternalDriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @ApiOperation({
    summary: 'List drivers (optionally filtered by company)',
  })
  @ApiQuery({ name: 'companyId', format: 'uuid', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiEnvelopeOkPaginatedResponse(DriverDto)
  @ApiEnvelopeUnauthorizedResponse()
  list(
    @Query(new ZodValidationPipe(companyScopedListQuerySchema))
    query: CompanyScopedListQueryDto,
  ): Promise<PaginatedResult<Driver>> {
    return this.driversService.list(internalTenantContext(), query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a driver by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeOkResponse(DriverDto)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  getById(@Param('id') id: string): Promise<Driver> {
    return this.driversService.getById(internalTenantContext(), id);
  }

  @Post('image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload a driver image and return its public path' })
  @ApiMultipartFileBody()
  @ApiEnvelopeOkResponse(DriverImageUploadDto)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  async uploadImage(
    @Req() request: FastifyRequest,
  ): Promise<DriverImageUploadDto> {
    const imageUrl = await readImageUpload(
      request,
      driverImageStorage,
      'Image must be 2 MB or smaller',
    );
    return { imageUrl };
  }

  @Post()
  @ApiOperation({ summary: 'Create a driver for any company' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(DriverDto)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  create(
    @CurrentUser() user: AuthSession,
    @Body(new ZodValidationPipe(createInternalDriverDtoSchema))
    dto: CreateInternalDriverDto,
  ): Promise<Driver> {
    return this.driversService.create(internalTenantContext(user), dto);
  }

  @Patch(':id/image')
  @ApiOperation({ summary: 'Replace a driver image' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: ReplaceDriverImageRequestDto })
  @ApiEnvelopeOkResponse(DriverDto)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  replaceImage(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<Driver> {
    const { imageUrl } = parseZodDto(replaceDriverImageDtoSchema, body);
    return this.driversService.replaceImage(
      internalTenantContext(user),
      id,
      imageUrl,
    );
  }

  @Delete(':id/image')
  @ApiOperation({ summary: 'Remove a driver image' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeOkResponse(DriverDto)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  removeImage(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<Driver> {
    return this.driversService.replaceImage(
      internalTenantContext(user),
      id,
      null,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a driver' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(DriverDto)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  update(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateInternalDriverDtoSchema))
    dto: UpdateInternalDriverDto,
  ): Promise<Driver> {
    return this.driversService.update(internalTenantContext(user), id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a driver' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  delete(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<null> {
    return this.driversService.delete(internalTenantContext(user), id);
  }
}
