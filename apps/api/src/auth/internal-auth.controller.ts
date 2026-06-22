import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  ApiEnvelopeBadRequestResponse,
  ApiEnvelopeOkResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import { AuthPayloadDto } from '../swagger/dto/auth-payload.dto';
import { LoginRequestDto } from '../swagger/dto/login-request.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import type { AdminSession } from './auth.types';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

type AuthPayload = {
  user: AdminSession;
};

@ApiTags('auth')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@Controller('internal/auth')
export class InternalAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Sign in with admin credentials' })
  @ApiBody({ type: LoginRequestDto })
  @ApiEnvelopeOkResponse(AuthPayloadDto)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  login(
    @Req() req: FastifyRequest & { user: AdminSession },
    @Res({ passthrough: true }) res: FastifyReply,
  ): AuthPayload {
    const user = req.user;
    const token = this.authService.signAdminToken(user);

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
  @ApiOperation({ summary: 'Get the current admin session' })
  @ApiEnvelopeOkResponse(AuthPayloadDto)
  @ApiEnvelopeUnauthorizedResponse()
  me(@Req() req: FastifyRequest & { user: AdminSession }): AuthPayload {
    const user = req.user;
    return { user };
  }
}
