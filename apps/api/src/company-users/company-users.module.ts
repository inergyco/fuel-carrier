import { Module } from '@nestjs/common';
import { CompanyUsersService } from './company-users.service';

@Module({
  providers: [CompanyUsersService],
  exports: [CompanyUsersService],
})
export class CompanyUsersModule {}
