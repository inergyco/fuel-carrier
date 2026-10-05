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
import type { Driver, PaginatedResult } from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
import {
  createExternalDriverDtoSchema,
  type CreateExternalDriverDto,
  updateExternalDriverDtoSchema,
  type UpdateExternalDriverDto,
} from '@fuel-carrier/shared-validation/driver/create';
import type { FastifyRequest } from 'fastify';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MustChangePasswordGuard } from '../auth/must-change-password.guard';
import { CompanyUserAdminGuard } from '../auth/company-user-admin.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthSession } from '../auth/auth.types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  resourceListQuerySchema,
  type ResourceListQueryDto,
} from '../common/dto/resource-list-query.dto';
import { parseZodDto } from '../common/validation/zod.utils';
import { tenantContextFromSession } from '../database/tenant-context.utils';
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
@UseGuards(JwtAuthGuard, RolesGuard, MustChangePasswordGuard)
@Roles(UserRole.COMPANY_USER)
@Controller('external/drivers')
export class ExternalDriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @ApiOperation({ summary: 'List drivers for the authenticated company' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiEnvelopeOkPaginatedResponse(DriverDto)
  @ApiEnvelopeUnauthorizedResponse()
  list(
    @CurrentUser() user: AuthSession,
    @Query(new ZodValidationPipe(resourceListQuerySchema))
    query: ResourceListQueryDto,
  ): Promise<PaginatedResult<Driver>> {
    return this.driversService.list(tenantContextFromSession(user), query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a driver belonging to the authenticated company',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeOkResponse(DriverDto)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  getById(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<Driver> {
    return this.driversService.getById(tenantContextFromSession(user), id);
  }

  @Post('image')
  @UseGuards(CompanyUserAdminGuard)
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
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({ summary: 'Create a driver for the authenticated company' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(DriverDto)
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

  @Patch(':id/image')
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({
    summary: 'Replace a driver image belonging to the authenticated company',
  })
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
      tenantContextFromSession(user),
      id,
      imageUrl,
    );
  }

  @Delete(':id/image')
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({
    summary: 'Remove a driver image belonging to the authenticated company',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeOkResponse(DriverDto)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  removeImage(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<Driver> {
    return this.driversService.replaceImage(
      tenantContextFromSession(user),
      id,
      null,
    );
  }

  @Patch(':id')
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({
    summary: 'Update a driver belonging to the authenticated company',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(DriverDto)
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
  @UseGuards(CompanyUserAdminGuard)
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
