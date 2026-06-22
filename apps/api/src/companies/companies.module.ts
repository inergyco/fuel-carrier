import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CompaniesService } from './companies.service';
import { InternalCompaniesController } from './internal-companies.controller';

@Module({
  imports: [AuthModule],
  controllers: [InternalCompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
