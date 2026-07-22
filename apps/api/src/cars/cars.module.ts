import { Module } from '@nestjs/common';
import { CarLocationsModule } from '../car-locations/car-locations.module';
import { CarsService } from './cars.service';

@Module({
  imports: [CarLocationsModule],
  providers: [CarsService],
  exports: [CarsService],
})
export class CarsModule {}
