import { Module } from '@nestjs/common';
import { CarLocationsService } from './car-locations.service';

@Module({
  providers: [CarLocationsService],
  exports: [CarLocationsService],
})
export class CarLocationsModule {}
