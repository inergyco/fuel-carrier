import { Module } from '@nestjs/common';
import { CarsReaderModule } from '../cars/cars-reader.module';
import { CarTelemetryGateway } from './car-telemetry.gateway';
import { CarTelemetryRealtimeService } from './car-telemetry-realtime.service';
import { CarTelemetryService } from './car-telemetry.service';

@Module({
  imports: [CarsReaderModule],
  providers: [
    CarTelemetryService,
    CarTelemetryRealtimeService,
    CarTelemetryGateway,
  ],
  exports: [CarTelemetryService],
})
export class CarTelemetryModule {}
