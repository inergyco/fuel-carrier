import { Module } from '@nestjs/common';
import { CarLocationsModule } from '../car-locations/car-locations.module';
import { CarsReaderModule } from './cars-reader.module';
import { CarsService } from './cars.service';

@Module({
  imports: [CarsReaderModule, CarLocationsModule],
  providers: [CarsService],
  exports: [CarsService],
})
export class CarsModule {}
