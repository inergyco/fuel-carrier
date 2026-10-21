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
  CompanyUser,
  PaginatedResult,
} from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
import {
  createInternalCompanyUserDtoSchema,
  type CreateInternalCompanyUserDto,
  updateInternalCompanyUserDtoSchema,
  type UpdateInternalCompanyUserDto,
} from '@fuel-carrier/shared-validation/company-user/create';
import type { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  companyRequiredListQuerySchema,
  type CompanyRequiredListQueryDto,
} from '../common/dto/company-scoped-list-query.dto';
import { internalTenantContext } from '../database/tenant-context.utils';
import {
  ApiEnvelopeBadRequestResponse,
  ApiEnvelopeNotFoundResponse,
  ApiEnvelopeOkPaginatedResponse,
  ApiEnvelopeOkResponse,
  ApiEnvelopeUnauthorizedResponse,
  ApiMultipartFileBody,
} from '../swagger/decorators/api-envelope.decorator';
import { CompanyUserImageDto } from '../swagger/dto/company-user.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { companyUserImageStorage } from '../uploads/image-storages';
import { readImageUpload } from '../uploads/read-image-upload';
import { CompanyUsersService } from './company-users.service';
import {
  replaceCompanyUserImageDtoSchema,
  type ReplaceCompanyUserImageDto,
} from './replace-company-user-image.dto';

@ApiTags('company-users')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INTERNAL_ADMIN)
@Controller('internal/company-users')
export class InternalCompanyUsersController {
  constructor(private readonly companyUsersService: CompanyUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List company users for a company' })
  @ApiQuery({ name: 'companyId', format: 'uuid', required: true })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiEnvelopeOkPaginatedResponse(Object)
  @ApiEnvelopeUnauthorizedResponse()
  list(
    @Query(new ZodValidationPipe(companyRequiredListQuerySchema))
    query: CompanyRequiredListQueryDto,
  ): Promise<PaginatedResult<CompanyUser>> {
    return this.companyUsersService.list(internalTenantContext(), query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company user by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  getById(@Param('id') id: string): Promise<CompanyUser> {
    return this.companyUsersService.getById(internalTenantContext(), id);
  }

  @Post('image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upload a company user image and return its public path',
  })
  @ApiMultipartFileBody()
  @ApiEnvelopeOkResponse(CompanyUserImageDto)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  async uploadImage(
    @Req() request: FastifyRequest,
  ): Promise<CompanyUserImageDto> {
    const imageUrl = await readImageUpload(
      request,
      companyUserImageStorage,
      'Image must be 2 MB or smaller',
    );
    return { imageUrl };
  }

  @Post('image/discard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete an uploaded company user image that was never saved',
  })
  @ApiBody({ type: CompanyUserImageDto })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  async discardImage(
    @Body(new ZodValidationPipe(replaceCompanyUserImageDtoSchema))
    body: ReplaceCompanyUserImageDto,
  ): Promise<null> {
    await this.companyUsersService.discardUploadedImage(body.imageUrl);
    return null;
  }

  @Post()
  @ApiOperation({ summary: 'Create a company user' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  create(
    @CurrentUser() user: AuthSession,
    @Body(new ZodValidationPipe(createInternalCompanyUserDtoSchema))
    dto: CreateInternalCompanyUserDto,
  ): Promise<CompanyUser> {
    return this.companyUsersService.create(internalTenantContext(user), dto);
  }

  @Patch(':id/image')
  @ApiOperation({ summary: 'Replace a company user image' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: CompanyUserImageDto })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  replaceImage(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(replaceCompanyUserImageDtoSchema))
    body: ReplaceCompanyUserImageDto,
  ): Promise<CompanyUser> {
    return this.companyUsersService.replaceImage(
      internalTenantContext(user),
      id,
      body.imageUrl,
    );
  }

  @Delete(':id/image')
  @ApiOperation({ summary: 'Remove a company user image' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  removeImage(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<CompanyUser> {
    return this.companyUsersService.replaceImage(
      internalTenantContext(user),
      id,
      null,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a company user' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  update(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateInternalCompanyUserDtoSchema))
    dto: UpdateInternalCompanyUserDto,
  ): Promise<CompanyUser> {
    return this.companyUsersService.update(
      internalTenantContext(user),
      id,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company user' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  delete(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<null> {
    return this.companyUsersService.delete(internalTenantContext(user), id);
  }
}
