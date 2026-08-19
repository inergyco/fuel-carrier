import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { AccessTokenService } from './access-token.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalAdminStrategy } from './local-admin.strategy';
import { LocalCompanyStrategy } from './local-company.strategy';
import { LoginAttemptService } from './login-attempt.service';
import { LoginRateLimitGuard } from './login-rate-limit.guard';
import { RolesGuard } from './roles.guard';
import { MustChangePasswordGuard } from './must-change-password.guard';
import { CompanyUserAdminGuard } from './company-user-admin.guard';

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<StringValue>('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    AccessTokenService,
    LoginAttemptService,
    LoginRateLimitGuard,
    LocalAdminStrategy,
    LocalCompanyStrategy,
    JwtStrategy,
    RolesGuard,
    MustChangePasswordGuard,
    CompanyUserAdminGuard,
  ],
  exports: [
    AuthService,
    JwtModule,
    RolesGuard,
    MustChangePasswordGuard,
    CompanyUserAdminGuard,
    LoginRateLimitGuard,
    LoginAttemptService,
    AccessTokenService,
  ],
})
export class AuthModule {}
