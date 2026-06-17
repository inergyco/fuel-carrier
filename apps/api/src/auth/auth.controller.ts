import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AdminSession } from './auth.types';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

type AuthPayload = {
  user: AdminSession;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
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
  logout(@Res({ passthrough: true }) res: FastifyReply): null {
    void res.clearCookie(this.authService.getAuthCookieName(), {
      path: '/api',
    });
    return null;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: FastifyRequest & { user: AdminSession }): AuthPayload {
    const user = req.user;
    return { user };
  }
}
