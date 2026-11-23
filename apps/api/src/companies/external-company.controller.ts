import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Inject,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole, type Company } from '@fuel-carrier/shared-types';
import type { FastifyRequest } from 'fastify';
import { CompanyUserAdminGuard } from '../auth/company-user-admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthSession } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { tenantContextFromSession } from '../database/tenant-context.utils';
import {
  ApiEnvelopeBadRequestResponse,
  ApiEnvelopeOkResponse,
  ApiEnvelopeUnauthorizedResponse,
  ApiMultipartFileBody,
} from '../swagger/decorators/api-envelope.decorator';
import { CompanyDto } from '../swagger/dto/company.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import type { ImageStorage } from '../uploads/image-storage';
import { COMPANY_LOGO_STORAGE } from '../uploads/image-storage.tokens';
import { readImageUpload } from '../uploads/read-image-upload';
import { CompaniesService } from './companies.service';

@ApiTags('company')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard, CompanyUserAdminGuard)
@Roles(UserRole.COMPANY_USER)
@Controller('external/company')
export class ExternalCompanyController {
  constructor(
    private readonly companiesService: CompaniesService,
    @Inject(COMPANY_LOGO_STORAGE)
    private readonly companyLogoStorage: ImageStorage,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get the signed-in company' })
  @ApiEnvelopeOkResponse(CompanyDto)
  @ApiEnvelopeUnauthorizedResponse()
  getCompany(@CurrentUser() user: AuthSession): Promise<Company> {
    return this.companiesService.getById(user.companyId!);
  }

  @Post('logo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload the signed-in company logo' })
  @ApiMultipartFileBody()
  @ApiEnvelopeOkResponse(CompanyDto)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  async uploadLogo(
    @CurrentUser() user: AuthSession,
    @Req() request: FastifyRequest,
  ): Promise<Company> {
    const logoUrl = await readImageUpload(
      request,
      this.companyLogoStorage,
      'Logo must be 2 MB or smaller',
    );
    return this.companiesService.replaceLogo(
      tenantContextFromSession(user),
      user.companyId!,
      logoUrl,
    );
  }

  @Delete('logo')
  @ApiOperation({ summary: 'Remove the signed-in company logo' })
  @ApiEnvelopeOkResponse(CompanyDto)
  @ApiEnvelopeUnauthorizedResponse()
  removeLogo(@CurrentUser() user: AuthSession): Promise<Company> {
    return this.companiesService.replaceLogo(
      tenantContextFromSession(user),
      user.companyId!,
      null,
    );
  }
}
