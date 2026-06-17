import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy as JwtStrategyBase } from 'passport-jwt';
import type { AdminSession, JwtPayload } from './auth.types';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase, 'jwt') {
  constructor(authService: AuthService, configService: ConfigService) {
    const cookieName = authService.getAuthCookieName();

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor(cookieName)]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): AdminSession {
    return {
      adminId: payload.sub,
      username: payload.username,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  }
}

function cookieExtractor(cookieName: string) {
  return (req: unknown): string | null => {
    const request = req as { cookies?: Record<string, string | undefined> };
    return request.cookies?.[cookieName] ?? null;
  };
}
