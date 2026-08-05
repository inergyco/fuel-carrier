import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mqtt, { type MqttClient } from 'mqtt';
import { CarLocationsService } from '../car-locations/car-locations.service';
import {
  parseTelemetryPayload,
  type TelemetrySample,
} from './mqtt-telemetry.utils';

@Injectable()
export class MqttTelemetrySubscriber implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttTelemetrySubscriber.name);
  private client: MqttClient | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly carLocationsService: CarLocationsService,
  ) {}

  onModuleInit(): void {
    const url = this.configService.get<string>('MQTT_URL');
    if (!url) {
      this.logger.log('MQTT_URL not set — telemetry subscriber disabled');
      return;
    }

    const username = this.configService.get<string>('MQTT_USERNAME');
    const password = this.configService.get<string>('MQTT_PASSWORD');
    const topic =
      this.configService.get<string>('MQTT_TELEMETRY_TOPIC') ?? 'telemetry/#';

    if (!username || !password) {
      this.logger.error(
        'MQTT_URL is set but MQTT_USERNAME / MQTT_PASSWORD are missing — subscriber disabled',
      );
      return;
    }

    this.client = mqtt.connect(url, {
      username,
      password,
      reconnectPeriod: 5_000,
      connectTimeout: 10_000,
    });

    this.client.on('connect', () => {
      this.logger.log(`Connected to MQTT broker; subscribing to ${topic}`);
      this.client?.subscribe(topic, (error) => {
        if (error) {
          this.logger.error(`Failed to subscribe to ${topic}`, error.stack);
        }
      });
    });

    this.client.on('reconnect', () => {
      this.logger.warn('Reconnecting to MQTT broker…');
    });

    this.client.on('error', (error) => {
      this.logger.error(`MQTT client error: ${error.message}`, error.stack);
    });

    this.client.on('message', (messageTopic, payload) => {
      void this._handleMessage(messageTopic, payload);
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.client) {
      return;
    }

    await new Promise<void>((resolve) => {
      this.client?.end(false, {}, () => resolve());
    });
    this.client = null;
  }

  private async _handleMessage(topic: string, payload: Buffer): Promise<void> {
    const sample: TelemetrySample | null = parseTelemetryPayload(
      topic,
      payload,
    );
    if (!sample) {
      this.logger.debug(`Ignoring invalid telemetry on ${topic}`);
      return;
    }

    try {
      await this.carLocationsService.ingestDeviceTelemetry(sample);
    } catch (error) {
      this.logger.error(
        `Failed to ingest telemetry for car ${sample.carId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
