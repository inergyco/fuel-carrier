import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy as JwtStrategyBase } from 'passport-jwt';
import { type AuthSession } from '@fuel-carrier/shared-types';
import type { JwtPayload } from './auth.types';
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

  validate({ sub, ...rest }: JwtPayload): AuthSession {
    return {
      userId: sub,
      ...rest,
    };
  }
}

function cookieExtractor(cookieName: string) {
  return (req: unknown): string | null => {
    const request = req as { cookies?: Record<string, string | undefined> };
    return request.cookies?.[cookieName] ?? null;
  };
}
