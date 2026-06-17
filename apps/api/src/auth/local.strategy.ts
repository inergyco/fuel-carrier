import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as LocalStrategyBase } from 'passport-local';
import type { AdminSession } from './auth.types';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(
  LocalStrategyBase,
  'local',
) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<AdminSession> {
    const admin = await this.authService.validateAdminCredentials(
      username,
      password,
    );

    if (!admin) {
      throw new UnauthorizedException();
    }

    return admin;
  }
}
