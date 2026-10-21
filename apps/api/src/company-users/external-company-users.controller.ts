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
import type { CompanyUser, PaginatedResult } from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
import {
  createExternalCompanyUserDtoSchema,
  type CreateExternalCompanyUserDto,
  updateExternalCompanyUserDtoSchema,
  type UpdateExternalCompanyUserDto,
} from '@fuel-carrier/shared-validation/company-user/create';
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
  paginationQuerySchema,
  type PaginationQueryDto,
} from '../common/dto/pagination-query.dto';
import { tenantContextFromSession } from '../database/tenant-context.utils';
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
@UseGuards(JwtAuthGuard, RolesGuard, MustChangePasswordGuard)
@Roles(UserRole.COMPANY_USER)
@Controller('external/company-users')
export class ExternalCompanyUsersController {
  constructor(private readonly companyUsersService: CompanyUsersService) {}

  @Get()
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({
    summary: 'List company users for the authenticated company',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiEnvelopeOkPaginatedResponse(Object)
  @ApiEnvelopeUnauthorizedResponse()
  list(
    @CurrentUser() user: AuthSession,
    @Query(new ZodValidationPipe(paginationQuerySchema))
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<CompanyUser>> {
    return this.companyUsersService.list(tenantContextFromSession(user), {
      ...query,
      companyId: user.companyId!,
    });
  }

  @Get(':id')
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({
    summary: 'Get a company user belonging to the authenticated company',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  getById(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<CompanyUser> {
    return this.companyUsersService.getById(tenantContextFromSession(user), id);
  }

  @Post('image')
  @UseGuards(CompanyUserAdminGuard)
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
  @UseGuards(CompanyUserAdminGuard)
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
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({
    summary: 'Create a company user for the authenticated company',
  })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  create(
    @CurrentUser() user: AuthSession,
    @Body(new ZodValidationPipe(createExternalCompanyUserDtoSchema))
    dto: CreateExternalCompanyUserDto,
  ): Promise<CompanyUser> {
    return this.companyUsersService.create(tenantContextFromSession(user), {
      ...dto,
      companyId: user.companyId!,
    });
  }

  @Patch(':id/image')
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({
    summary:
      'Replace a company user image belonging to the authenticated company',
  })
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
      tenantContextFromSession(user),
      id,
      body.imageUrl,
    );
  }

  @Delete(':id/image')
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({
    summary:
      'Remove a company user image belonging to the authenticated company',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeOkResponse(Object)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  removeImage(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<CompanyUser> {
    return this.companyUsersService.replaceImage(
      tenantContextFromSession(user),
      id,
      null,
    );
  }

  @Patch(':id')
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({
    summary: 'Update a company user belonging to the authenticated company',
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
    @Body(new ZodValidationPipe(updateExternalCompanyUserDtoSchema))
    dto: UpdateExternalCompanyUserDto,
  ): Promise<CompanyUser> {
    return this.companyUsersService.update(
      tenantContextFromSession(user),
      id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({
    summary: 'Delete a company user belonging to the authenticated company',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  delete(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<null> {
    return this.companyUsersService.delete(tenantContextFromSession(user), id);
  }
}
