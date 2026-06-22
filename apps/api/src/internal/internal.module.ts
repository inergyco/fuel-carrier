import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InternalAuthController } from './internal-auth.controller';
import { InternalHealthController } from './internal-health.controller';

@Module({
  imports: [AuthModule],
  controllers: [InternalAuthController, InternalHealthController],
})
export class InternalModule {}
