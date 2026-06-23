import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { UserRole, type AuthSession } from '@fuel-carrier/shared-types';
import { changePasswordDtoSchema } from '@fuel-carrier/shared-validation/auth/change-password';
import {
  ApiEnvelopeBadRequestResponse,
  ApiEnvelopeOkResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import { AuthPayloadDto } from '../swagger/dto/auth-payload.dto';
import { ChangePasswordRequestDto } from '../swagger/dto/change-password-request.dto';
import { LoginRequestDto } from '../swagger/dto/login-request.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { ChangePasswordDto } from '@fuel-carrier/shared-validation/auth/change-password';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalCompanyAuthGuard } from './local-company-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

type AuthPayload = {
  user: AuthSession;
};

@ApiTags('auth')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@Controller('external/auth')
export class ExternalAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalCompanyAuthGuard)
  @ApiOperation({ summary: 'Sign in with company user credentials' })
  @ApiBody({ type: LoginRequestDto })
  @ApiEnvelopeOkResponse(AuthPayloadDto)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  login(
    @CurrentUser() user: AuthSession,
    @Res({ passthrough: true }) res: FastifyReply,
  ): AuthPayload {
    this._setAuthCookie(res, user);
    return { user };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Clear the auth cookie' })
  @ApiNoContentResponse({ description: 'Signed out successfully' })
  logout(@Res({ passthrough: true }) res: FastifyReply): null {
    void res.clearCookie(this.authService.getAuthCookieName(), {
      path: '/api',
    });
    return null;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_USER)
  @ApiOperation({ summary: 'Get the current company user session' })
  @ApiEnvelopeOkResponse(AuthPayloadDto)
  @ApiEnvelopeUnauthorizedResponse()
  async me(@CurrentUser() user: AuthSession): Promise<AuthPayload> {
    const fresh = await this.authService.getCompanyUserSession(user.userId);
    return { user: fresh ?? user };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_USER)
  @ApiOperation({ summary: 'Change the current company user password' })
  @ApiBody({ type: ChangePasswordRequestDto })
  @ApiEnvelopeOkResponse(AuthPayloadDto)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  async changePassword(
    @CurrentUser() user: AuthSession,
    @Body(new ZodValidationPipe(changePasswordDtoSchema))
    dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<AuthPayload> {
    const updated = await this.authService.changeCompanyUserPassword(
      user,
      dto.currentPassword,
      dto.newPassword,
    );

    this._setAuthCookie(res, updated);
    return { user: updated };
  }

  private _setAuthCookie(res: FastifyReply, user: AuthSession): void {
    const token = this.authService.signToken(user);

    void res.setCookie(this.authService.getAuthCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: this.authService.getAuthCookieSameSite(),
      path: '/api',
      maxAge: this.authService.getAuthCookieMaxAgeMs() / 1000,
    });
  }
}
