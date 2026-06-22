import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserRole, type AuthSession } from '@fuel-carrier/shared-types';
import { isValidUsername } from '@fuel-carrier/shared-validation/username';
import { DATABASE } from '../database/database.tokens';
import type { Database } from '../database/database.types';
import { admins } from '../database/schema/admins';
import { companyUsers } from '../database/schema/company-users';
import type { JwtPayload } from './auth.types';
import { getAuthCookieMaxAgeMs } from './cookie.utils';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAdminCredentials(
    username: string,
    password: string,
  ): Promise<AuthSession | null> {
    if (!isValidUsername(username)) {
      return null;
    }

    const admin = await this.db.query.admins.findFirst({
      where: eq(admins.username, username),
      with: { user: true },
    });

    if (!admin?.user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return null;
    }

    return {
      userId: admin.userId,
      role: UserRole.INTERNAL_ADMIN,
      username: admin.username,
      firstName: admin.user.firstName,
      lastName: admin.user.lastName,
    };
  }

  async validateCompanyUserCredentials(
    username: string,
    password: string,
  ): Promise<AuthSession | null> {
    if (!isValidUsername(username)) {
      return null;
    }

    const companyUser = await this.db.query.companyUsers.findFirst({
      where: eq(companyUsers.username, username),
      with: { user: true },
    });

    if (!companyUser?.user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, companyUser.passwordHash);
    if (!isValid) {
      return null;
    }

    return {
      userId: companyUser.userId,
      role: UserRole.COMPANY_USER,
      companyId: companyUser.companyId,
      username: companyUser.username,
      firstName: companyUser.user.firstName,
      lastName: companyUser.user.lastName,
    };
  }

  getAuthCookieName(): string {
    return this.configService.getOrThrow<string>('AUTH_COOKIE_NAME');
  }

  getAuthCookieSameSite(): 'lax' | 'strict' | 'none' {
    return this.configService.getOrThrow<'lax' | 'strict' | 'none'>(
      'AUTH_COOKIE_SAME_SITE',
    );
  }

  getJwtSecret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET');
  }

  private _getJwtExpiresIn(): string {
    return this.configService.getOrThrow<string>('JWT_EXPIRES_IN');
  }

  signToken(session: AuthSession): string {
    const payload: JwtPayload = {
      sub: session.userId,
      role: session.role,
      companyId: session.companyId,
      username: session.username,
      firstName: session.firstName,
      lastName: session.lastName,
    };

    return this.jwtService.sign(payload);
  }

  /** @deprecated Use signToken instead. */
  signAdminToken(session: AuthSession): string {
    return this.signToken(session);
  }

  getAuthCookieMaxAgeMs(): number {
    return getAuthCookieMaxAgeMs(this._getJwtExpiresIn());
  }
}
