import { Module } from '@nestjs/common';
import { CarLocationsModule } from '../car-locations/car-locations.module';
import { MqttCredentialsService } from './mqtt-credentials.service';
import { MqttTelemetrySubscriber } from './mqtt-telemetry.subscriber';

@Module({
  imports: [CarLocationsModule],
  providers: [MqttCredentialsService, MqttTelemetrySubscriber],
  exports: [MqttCredentialsService],
})
export class MqttModule {}
