import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CarTelemetryService } from '../car-telemetry/car-telemetry.service';
import { MqttBrokerService } from './mqtt-broker.service';
import { MqttOutputCommandService } from './mqtt-output-command.service';
import { buildMqttAckTopic } from './mqtt-secret.utils';
import {
  buildTelemetryAck,
  parseTelemetryPayload,
  type TelemetrySample,
} from './mqtt-telemetry.utils';
import { isOutputAckTopic } from './mqtt-output-command.utils';

@Injectable()
export class MqttTelemetrySubscriber implements OnModuleInit {
  private readonly logger = new Logger(MqttTelemetrySubscriber.name);

  constructor(
    private readonly broker: MqttBrokerService,
    private readonly carTelemetryService: CarTelemetryService,
    private readonly outputCommandService: MqttOutputCommandService,
  ) {}

  onModuleInit(): void {
    this.broker.addMessageHandler((topic, payload) =>
      this._handleMessage(topic, payload),
    );
  }

  private async _handleMessage(topic: string, payload: Buffer): Promise<void> {
    // Output ACKs are handled by MqttOutputCommandService on the same fan-out.
    if (isOutputAckTopic(topic)) {
      return;
    }

    const sample: TelemetrySample | null = parseTelemetryPayload(
      topic,
      payload,
    );
    if (!sample) {
      this.logger.debug(`Ignoring invalid telemetry on ${topic}`);
      return;
    }

    try {
      await this.outputCommandService.rememberDeviceIdentity(sample.carId, {
        companyCode: sample.companyId,
        deviceId: sample.deviceId,
      });

      const stored =
        await this.carTelemetryService.ingestDeviceTelemetry(sample);
      if (!stored) {
        return;
      }

      await this._publishAck(sample);
    } catch (error) {
      this.logger.error(
        `Failed to ingest telemetry for car ${sample.carId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async _publishAck(sample: TelemetrySample): Promise<void> {
    if (!this.broker.isConnected) {
      this.logger.warn(
        `Skipping ACK for car ${sample.carId}: MQTT client not connected`,
      );
      return;
    }

    const ackTopic = buildMqttAckTopic(sample.carId);
    const ack = buildTelemetryAck({ sample });
    const body = JSON.stringify(ack);

    try {
      await this.broker.publish(ackTopic, body, { qos: 2 });
    } catch (error) {
      this.logger.error(
        `Failed to publish ACK on ${ackTopic}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
