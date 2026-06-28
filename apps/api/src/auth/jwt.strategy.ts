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
    const internalCookieName = authService.getInternalAuthCookieName();
    const externalCookieName = authService.getExternalAuthCookieName();

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        portalCookieExtractor(internalCookieName, externalCookieName),
      ]),
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

function portalCookieExtractor(
  internalCookieName: string,
  externalCookieName: string,
) {
  return (req: unknown): string | null => {
    const request = req as {
      cookies?: Record<string, string | undefined>;
      url?: string;
      raw?: { url?: string };
    };
    const cookies = request.cookies;

    if (!cookies) {
      return null;
    }

    const path = request.url ?? request.raw?.url ?? '';

    if (path.includes('/external/')) {
      return cookies[externalCookieName] ?? null;
    }

    if (path.includes('/internal/')) {
      return cookies[internalCookieName] ?? null;
    }

    return cookies[internalCookieName] ?? cookies[externalCookieName] ?? null;
  };
}
