import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuditContextMiddleware } from './audit-context.middleware';
import { AuditLogService } from './audit-log.service';
import { AuditRequestContext } from './audit-request.context';
import { InternalAuditLogsController } from './internal-audit-logs.controller';

@Global()
@Module({
  controllers: [InternalAuditLogsController],
  providers: [AuditRequestContext, AuditLogService, AuditContextMiddleware],
  exports: [AuditLogService, AuditRequestContext],
})
export class AuditLogsModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuditContextMiddleware).forRoutes('*');
  }
}
