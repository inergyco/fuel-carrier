import { Module } from '@nestjs/common';
import { CarsReaderModule } from '../cars/cars-reader.module';
import { CarLocationsService } from './car-locations.service';

@Module({
  imports: [CarsReaderModule],
  providers: [CarLocationsService],
  exports: [CarLocationsService],
})
export class CarLocationsModule {}
