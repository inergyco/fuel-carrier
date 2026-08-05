import { Module } from '@nestjs/common';
import { CarTelemetryModule } from '../car-telemetry/car-telemetry.module';
import { MqttCredentialsService } from './mqtt-credentials.service';
import { MqttTelemetrySubscriber } from './mqtt-telemetry.subscriber';

@Module({
  imports: [CarTelemetryModule],
  providers: [MqttCredentialsService, MqttTelemetrySubscriber],
  exports: [MqttCredentialsService],
})
export class MqttModule {}
