import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DriversService } from './drivers.service';
@Module({
  imports: [AuthModule],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
