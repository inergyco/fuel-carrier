import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { createPinoHttpOptions } from './common/logging';
import { type Env, validateEnv } from './config/env.schema';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { ExternalModule } from './external/external.module';
import { InternalModule } from './internal/internal.module';
import { MqttModule } from './mqtt/mqtt.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: function createPinoLoggerOptions(
        configService: ConfigService<Env, true>,
      ) {
        return {
          pinoHttp: createPinoHttpOptions({
            level: configService.get('LOG_LEVEL', { infer: true }),
            isProduction:
              configService.get('NODE_ENV', { infer: true }) === 'production',
          }),
        };
      },
    }),
    DatabaseModule,
    RedisModule,
    AuditLogsModule,
    AuthModule,
    MqttModule,
    HealthModule,
    InternalModule,
    ExternalModule,
  ],
  providers: [ApiExceptionFilter],
})
export class AppModule {}
