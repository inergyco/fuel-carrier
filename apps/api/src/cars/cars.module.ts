import { Module } from '@nestjs/common';
import { CarTelemetryModule } from '../car-telemetry/car-telemetry.module';
import { CarDriverAssignmentsService } from './car-driver-assignments.service';
import { CarsReaderModule } from './cars-reader.module';
import { CarsService } from './cars.service';

@Module({
  imports: [CarsReaderModule, CarTelemetryModule],
  providers: [CarsService, CarDriverAssignmentsService],
  exports: [CarsService, CarDriverAssignmentsService],
})
export class CarsModule {}
