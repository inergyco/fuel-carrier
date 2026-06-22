import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CompaniesService } from './companies.service';
@Module({
  imports: [AuthModule],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
