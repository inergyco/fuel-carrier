import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { DATABASE } from '../database/database.tokens';
import type { Database } from '../database/database.types';
import { admins } from '../database/schema/admins';
import { users } from '../database/schema/users';
import { isValidUsername } from '../database/constants/username';
import type { AdminSession } from './auth.types';
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
  ): Promise<AdminSession | null> {
    if (!isValidUsername(username)) {
      return null;
    }

    // TODO: Inforce complex passwords.
    if (password.length < 8) {
      return null;
    }

    const [row] = await this.db
      .select({
        adminId: admins.id,
        username: admins.username,
        firstName: users.firstName,
        lastName: users.lastName,
        passwordHash: admins.passwordHash,
      })
      .from(admins)
      .innerJoin(users, eq(admins.userId, users.id)) // TODO: Join using the relations.
      .where(eq(admins.username, username))
      .limit(1);

    if (!row) {
      return null;
    }

    const isValid = await bcrypt.compare(password, row.passwordHash);
    if (!isValid) {
      return null;
    }

    return {
      adminId: row.adminId,
      username: row.username,
      firstName: row.firstName,
      lastName: row.lastName,
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

  signAdminToken(admin: AdminSession): string {
    return this.jwtService.sign({
      sub: admin.adminId,
      username: admin.username,
      firstName: admin.firstName,
      lastName: admin.lastName,
    });
  }

  getAuthCookieMaxAgeMs(): number {
    return getAuthCookieMaxAgeMs(this._getJwtExpiresIn());
  }
}
