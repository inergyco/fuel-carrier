import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@fuel-carrier/shared-types';
import { AccessTokenService } from './access-token.service';
import { AuthService } from './auth.service';
import type { JwtPayload } from './auth.types';

describe('AuthService.resolveSessionFromJwtPayload', () => {
  let service: AuthService;
  let findFirst: jest.Mock;
  let isRevoked: jest.Mock;

  beforeEach(() => {
    findFirst = jest.fn();
    isRevoked = jest.fn().mockResolvedValue(false);

    service = new AuthService(
      {
        query: {
          companyUsers: { findFirst },
        },
      } as never,
      {
        getOrThrow: jest.fn(),
      } as unknown as ConfigService,
      {} as JwtService,
      {
        isRevoked,
        revoke: jest.fn(),
      } as unknown as AccessTokenService,
    );
  });

  function companyPayload(overrides: Partial<JwtPayload> = {}): JwtPayload {
    return {
      sub: 'user-1',
      role: UserRole.COMPANY_USER,
      companyId: 'company-stale',
      companyUserLevel: 'admin',
      username: 'stale_admin',
      firstName: 'Stale',
      lastName: 'Admin',
      mustChangePassword: false,
      jti: 'jti-1',
      ...overrides,
    };
  }

  it('returns null when the access token is revoked', async () => {
    isRevoked.mockResolvedValue(true);

    await expect(
      service.resolveSessionFromJwtPayload(companyPayload()),
    ).resolves.toBeNull();
    expect(findFirst).not.toHaveBeenCalled();
  });

  it('reloads company-user level and mustChangePassword from the DB', async () => {
    findFirst.mockResolvedValue({
      userId: 'user-1',
      companyId: 'company-live',
      level: 'viewer',
      username: 'live_viewer',
      mustChangePassword: true,
      user: { firstName: 'Live', lastName: 'Viewer' },
      company: { logoUrl: null },
    });

    const session =
      await service.resolveSessionFromJwtPayload(companyPayload());

    expect(session).toEqual({
      userId: 'user-1',
      role: UserRole.COMPANY_USER,
      companyId: 'company-live',
      companyUserLevel: 'viewer',
      username: 'live_viewer',
      firstName: 'Live',
      lastName: 'Viewer',
      mustChangePassword: true,
      companyLogoUrl: null,
    });
  });

  it('returns null when the company user row is missing', async () => {
    findFirst.mockResolvedValue(undefined);

    await expect(
      service.resolveSessionFromJwtPayload(companyPayload()),
    ).resolves.toBeNull();
  });

  it('keeps internal admin sessions on JWT claims', async () => {
    const session = await service.resolveSessionFromJwtPayload({
      sub: 'admin-1',
      role: UserRole.INTERNAL_ADMIN,
      username: 'khosravi',
      firstName: 'Internal',
      lastName: 'Admin',
      jti: 'jti-admin',
    });

    expect(session).toEqual({
      userId: 'admin-1',
      role: UserRole.INTERNAL_ADMIN,
      username: 'khosravi',
      firstName: 'Internal',
      lastName: 'Admin',
    });
    expect(findFirst).not.toHaveBeenCalled();
  });
});
