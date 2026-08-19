import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy as JwtStrategyBase } from 'passport-jwt';
import { type AuthSession } from '@fuel-carrier/shared-types';
import type { FastifyRequest } from 'fastify';
import type { JwtPayload } from './auth.types';
import type { AccessTokenClaims } from './access-token.constants';
import { AuthService } from './auth.service';

type RequestWithAccessToken = FastifyRequest & {
  accessToken?: AccessTokenClaims;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase, 'jwt') {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    const internalCookieName = authService.getInternalAuthCookieName();
    const externalCookieName = authService.getExternalAuthCookieName();

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        portalCookieExtractor(internalCookieName, externalCookieName),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(
    request: RequestWithAccessToken,
    payload: JwtPayload,
  ): Promise<AuthSession> {
    if (await this.authService.isAccessTokenRevoked(payload.jti)) {
      throw new UnauthorizedException();
    }

    request.accessToken = { jti: payload.jti, exp: payload.exp };

    return {
      userId: payload.sub,
      role: payload.role,
      companyId: payload.companyId,
      companyUserLevel: payload.companyUserLevel,
      username: payload.username,
      firstName: payload.firstName,
      lastName: payload.lastName,
      mustChangePassword: payload.mustChangePassword,
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
