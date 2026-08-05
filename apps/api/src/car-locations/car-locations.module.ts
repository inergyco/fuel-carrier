import { Module } from '@nestjs/common';
import { CarsReaderModule } from '../cars/cars-reader.module';
import { CarLocationsGateway } from './car-locations.gateway';
import { CarLocationsRealtimeService } from './car-locations-realtime.service';
import { CarLocationsService } from './car-locations.service';

@Module({
  imports: [CarsReaderModule],
  providers: [
    CarLocationsService,
    CarLocationsRealtimeService,
    CarLocationsGateway,
  ],
  exports: [CarLocationsService],
})
export class CarLocationsModule {}
