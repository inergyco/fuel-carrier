import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CompaniesModule } from '../companies/companies.module';
import { InternalHealthController } from './internal-health.controller';

@Module({
  imports: [AuthModule, CompaniesModule],
  controllers: [InternalHealthController],
})
export class InternalModule {}
