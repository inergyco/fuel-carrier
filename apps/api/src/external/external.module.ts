import { Module } from '@nestjs/common';
import { ExternalHealthController } from './external-health.controller';

@Module({
  controllers: [ExternalHealthController],
})
export class ExternalModule {}
