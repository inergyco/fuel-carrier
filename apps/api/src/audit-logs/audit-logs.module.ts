import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditContextInterceptor } from './audit-context.interceptor';
import { AuditLogService } from './audit-log.service';
import { AuditRequestContext } from './audit-request.context';
import { InternalAuditLogsController } from './internal-audit-logs.controller';

@Global()
@Module({
  controllers: [InternalAuditLogsController],
  providers: [
    AuditRequestContext,
    AuditLogService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditContextInterceptor,
    },
  ],
  exports: [AuditLogService, AuditRequestContext],
})
export class AuditLogsModule {}
