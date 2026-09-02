import { Module } from '@nestjs/common';
import { CarsModule } from '../cars/cars.module';
import { DriversService } from './drivers.service';

@Module({
  imports: [CarsModule],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
