import { Module } from '@nestjs/common';
import { CarTelemetryModule } from '../car-telemetry/car-telemetry.module';
import { CarsReaderModule } from '../cars/cars-reader.module';
import { MqttBrokerService } from './mqtt-broker.service';
import { MqttCredentialsService } from './mqtt-credentials.service';
import { MqttOutputCommandService } from './mqtt-output-command.service';
import { MqttTelemetrySubscriber } from './mqtt-telemetry.subscriber';

@Module({
  imports: [CarTelemetryModule, CarsReaderModule],
  providers: [
    MqttBrokerService,
    MqttCredentialsService,
    MqttOutputCommandService,
    MqttTelemetrySubscriber,
  ],
  exports: [MqttCredentialsService, MqttOutputCommandService],
})
export class MqttModule {}
