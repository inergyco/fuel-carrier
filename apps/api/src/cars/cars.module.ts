import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CarsService } from './cars.service';
@Module({
  imports: [AuthModule],
  providers: [CarsService],
  exports: [CarsService],
})
export class CarsModule {}
