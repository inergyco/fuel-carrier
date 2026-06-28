import { Inject, Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import {
  ApiErrorCode,
  UserRole,
  type AuthSession,
} from '@fuel-carrier/shared-types';
import { isValidUsername } from '@fuel-carrier/shared-validation/username';
import { DATABASE } from '../database/database.tokens';
import type { Database } from '../database/database.types';
import { admins } from '../database/schema/admins';
import { companyUsers } from '../database/schema/company-users';
import type { JwtPayload } from './auth.types';
import { getAuthCookieMaxAgeMs } from './cookie.utils';
import { createApiException } from '../common/exceptions/api.exception';
import { hashPassword } from './password.utils';

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
      mustChangePassword: companyUser.mustChangePassword,
    };
  }

  async getCompanyUserSession(userId: string): Promise<AuthSession | null> {
    const companyUser = await this.db.query.companyUsers.findFirst({
      where: eq(companyUsers.userId, userId),
      with: { user: true },
    });

    if (!companyUser?.user) {
      return null;
    }

    return {
      userId: companyUser.userId,
      role: UserRole.COMPANY_USER,
      companyId: companyUser.companyId,
      username: companyUser.username,
      firstName: companyUser.user.firstName,
      lastName: companyUser.user.lastName,
      mustChangePassword: companyUser.mustChangePassword,
    };
  }

  async changeCompanyUserPassword(
    session: AuthSession,
    currentPassword: string,
    newPassword: string,
  ): Promise<AuthSession> {
    const companyUser = await this.db.query.companyUsers.findFirst({
      where: eq(companyUsers.userId, session.userId),
      with: { user: true },
    });

    if (!companyUser?.user) {
      throw createApiException(
        HttpStatus.NOT_FOUND,
        ApiErrorCode.NOT_FOUND,
        'Company user not found',
      );
    }

    const isValid = await bcrypt.compare(
      currentPassword,
      companyUser.passwordHash,
    );
    if (!isValid) {
      throw createApiException(
        HttpStatus.UNAUTHORIZED,
        ApiErrorCode.UNAUTHORIZED,
        'Current password is incorrect',
      );
    }

    const passwordHash = await hashPassword(newPassword);

    await this.db
      .update(companyUsers)
      .set({ passwordHash, mustChangePassword: false })
      .where(eq(companyUsers.userId, session.userId));

    return {
      userId: companyUser.userId,
      role: UserRole.COMPANY_USER,
      companyId: companyUser.companyId,
      username: companyUser.username,
      firstName: companyUser.user.firstName,
      lastName: companyUser.user.lastName,
      mustChangePassword: false,
    };
  }

  getInternalAuthCookieName(): string {
    return this.configService.getOrThrow<string>('INTERNAL_AUTH_COOKIE_NAME');
  }

  getExternalAuthCookieName(): string {
    return this.configService.getOrThrow<string>('EXTERNAL_AUTH_COOKIE_NAME');
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
      mustChangePassword: session.mustChangePassword,
    };

    return this.jwtService.sign(payload);
  }

  getAuthCookieMaxAgeMs(): number {
    return getAuthCookieMaxAgeMs(this._getJwtExpiresIn());
  }
}
