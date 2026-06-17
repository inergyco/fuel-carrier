import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as LocalStrategyBase } from 'passport-local';
import { parseZodDto } from '../common/validation/zod.utils';
import type { AdminSession } from './auth.types';
import { AuthService } from './auth.service';
import {
  loginDtoSchema,
  type LoginDto,
} from '@fuel-carrier/shared-validation/admin/login';

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
    const credentials: LoginDto = parseZodDto(loginDtoSchema, {
      username,
      password,
    });

    const admin = await this.authService.validateAdminCredentials(
      credentials.username,
      credentials.password,
    );

    if (!admin) {
      throw new UnauthorizedException();
    }

    return admin;
  }
}
