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
import {
  ApiEnvelopeBadRequestResponse,
  ApiEnvelopeOkResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import { AuthPayloadDto } from '../swagger/dto/auth-payload.dto';
import { LoginRequestDto } from '../swagger/dto/login-request.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalCompanyAuthGuard } from './local-company-auth.guard';

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
    const token = this.authService.signToken(user);

    void res.setCookie(this.authService.getAuthCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: this.authService.getAuthCookieSameSite(),
      path: '/api',
      maxAge: this.authService.getAuthCookieMaxAgeMs() / 1000,
    });

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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the current company user session' })
  @ApiEnvelopeOkResponse(AuthPayloadDto)
  @ApiEnvelopeUnauthorizedResponse()
  me(@CurrentUser() user: AuthSession): AuthPayload {
    return { user };
  }
}
