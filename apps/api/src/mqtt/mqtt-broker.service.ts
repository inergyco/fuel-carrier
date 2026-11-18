import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mqtt, { type IClientPublishOptions, type MqttClient } from 'mqtt';
import { buildMqttSharedSubscribeTopic } from './mqtt-secret.utils';

type MessageHandler = (topic: string, payload: Buffer) => void | Promise<void>;

/**
 * Single shared MQTT connection for the API process.
 * Telemetry ingest uses a `$share` group (one instance per message).
 * Outbound device commands are published only by the HTTP-handling
 * instance; GPIO `output-ack` replies are mirrored over Redis so the
 * waiting instance can resolve even when `$share` delivers elsewhere.
 */
@Injectable()
export class MqttBrokerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttBrokerService.name);
  private client: MqttClient | null = null;
  private readonly handlers = new Set<MessageHandler>();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const url = this.configService.get<string>('MQTT_URL');
    if (!url) {
      this.logger.log('MQTT_URL not set — MQTT broker client disabled');
      return;
    }

    const username = this.configService.get<string>('MQTT_USERNAME');
    const password = this.configService.get<string>('MQTT_PASSWORD');
    const topicFilter =
      this.configService.get<string>('MQTT_TELEMETRY_TOPIC') ?? 'telemetry/#';
    const shareGroup =
      this.configService.get<string>('MQTT_SHARE_GROUP') ?? 'fuel-carrier';

    if (!username || !password) {
      this.logger.error(
        'MQTT_URL is set but MQTT_USERNAME / MQTT_PASSWORD are missing — MQTT broker client disabled',
      );
      return;
    }

    const topic = resolveTelemetrySubscribeTopic({ topicFilter, shareGroup });

    this.client = mqtt.connect(url, {
      username,
      password,
      // Distinct per process so two systemd instances do not kick each other off.
      clientId: `fuel-carrier-api-${process.pid}`,
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
      for (const handler of this.handlers) {
        void Promise.resolve(handler(messageTopic, payload)).catch((error) => {
          this.logger.error(
            `MQTT message handler failed for ${messageTopic}`,
            error instanceof Error ? error.stack : undefined,
          );
        });
      }
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

  /** Register a fan-out handler for every inbound broker message. */
  addMessageHandler(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  get isConnected(): boolean {
    return Boolean(this.client?.connected);
  }

  async publish(
    topic: string,
    payload: string | Buffer,
    options: IClientPublishOptions = {},
  ): Promise<void> {
    if (!this.client?.connected) {
      throw new Error('MQTT client is not connected');
    }

    await new Promise<void>((resolve, reject) => {
      this.client?.publish(topic, payload, options, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}

function resolveTelemetrySubscribeTopic(options: {
  topicFilter: string;
  shareGroup: string;
}): string {
  if (options.shareGroup === 'none') {
    return options.topicFilter;
  }

  return buildMqttSharedSubscribeTopic(options);
}
