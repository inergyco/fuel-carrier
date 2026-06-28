import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import type { AuthSession } from '@fuel-carrier/shared-types';
import { AuditAction, UserRole } from '@fuel-carrier/shared-types';
import {
  ApiEnvelopeBadRequestResponse,
  ApiEnvelopeOkResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import { AuthPayloadDto } from '../swagger/dto/auth-payload.dto';
import { LoginRequestDto } from '../swagger/dto/login-request.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { AuditLogService } from '../audit-logs/audit-log.service';
import { internalTenantContext } from '../database/tenant-context.utils';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAdminAuthGuard } from './local-admin-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

type AuthPayload = {
  user: AuthSession;
};

@ApiTags('auth')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@Controller('internal/auth')
export class InternalAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post('login')
  @UseGuards(LocalAdminAuthGuard)
  @ApiOperation({ summary: 'Sign in with internal admin credentials' })
  @ApiBody({ type: LoginRequestDto })
  @ApiEnvelopeOkResponse(AuthPayloadDto)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  login(
    @CurrentUser() user: AuthSession,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<AuthPayload> {
    const token = this.authService.signToken(user);

    void res.setCookie(this.authService.getInternalAuthCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: this.authService.getAuthCookieSameSite(),
      path: '/api',
      maxAge: this.authService.getAuthCookieMaxAgeMs() / 1000,
    });

    return this.auditLogService
      .record(internalTenantContext(), {
        action: AuditAction.AUTH_LOGIN_SUCCEEDED,
        metadata: { portal: 'internal' },
        actor: user,
      })
      .then(function returnPayload() {
        return { user };
      });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INTERNAL_ADMIN)
  @ApiOperation({ summary: 'Clear the auth cookie' })
  @ApiNoContentResponse({ description: 'Signed out successfully' })
  logout(
    @CurrentUser() user: AuthSession,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<null> {
    void res.clearCookie(this.authService.getInternalAuthCookieName(), {
      path: '/api',
    });

    return this.auditLogService
      .record(internalTenantContext(), {
        action: AuditAction.AUTH_LOGOUT,
        metadata: { portal: 'internal' },
        actor: user,
      })
      .then(function returnNull() {
        return null;
      });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the current internal admin session' })
  @ApiEnvelopeOkResponse(AuthPayloadDto)
  @ApiEnvelopeUnauthorizedResponse()
  me(@CurrentUser() user: AuthSession): AuthPayload {
    return { user };
  }
}
