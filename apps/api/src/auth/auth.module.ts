import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalAdminStrategy } from './local-admin.strategy';
import { LocalCompanyStrategy } from './local-company.strategy';
import { RolesGuard } from './roles.guard';
import { MustChangePasswordGuard } from './must-change-password.guard';

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
    LocalAdminStrategy,
    LocalCompanyStrategy,
    JwtStrategy,
    RolesGuard,
    MustChangePasswordGuard,
  ],
  exports: [AuthService, RolesGuard, MustChangePasswordGuard],
})
export class AuthModule {}
