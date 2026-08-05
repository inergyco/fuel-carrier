import { Module } from '@nestjs/common';
import { CarTelemetryModule } from '../car-telemetry/car-telemetry.module';
import { CarsReaderModule } from './cars-reader.module';
import { CarsService } from './cars.service';

@Module({
  imports: [CarsReaderModule, CarTelemetryModule],
  providers: [CarsService],
  exports: [CarsService],
})
export class CarsModule {}
