import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { AdminSession } from './auth.types';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(
    @Req() req: Request & { user: AdminSession },
    @Res({ passthrough: true }) res: Response,
  ): { user: AdminSession } {
    const user = req.user;
    const token = this.authService.signAdminToken(user);

    res.cookie(this.authService.getAuthCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: this.authService.getAuthCookieSameSite(),
      path: '/api',
      maxAge: this.authService.getAuthCookieMaxAgeMs(),
    });

    return { user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response): { ok: true } {
    res.clearCookie(this.authService.getAuthCookieName(), {
      path: '/api',
    });
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request & { user: AdminSession }): { user: AdminSession } {
    const user = req.user;
    return { user };
  }
}
