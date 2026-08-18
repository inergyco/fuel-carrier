import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS } from '../redis/redis.tokens';
import type { CarTelemetryRealtimeEvent } from '@fuel-carrier/shared-types/car-telemetry';

export const CAR_TELEMETRY_UPDATES_CHANNEL = 'car-telemetry-updates';

type RealtimeListener = (event: CarTelemetryRealtimeEvent) => void;

/**
 * Cross-process fan-out for live map updates via Redis pub/sub.
 * Any API instance can publish; every instance notifies its local WS clients.
 */
@Injectable()
export class CarTelemetryRealtimeService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(CarTelemetryRealtimeService.name);
  private subscriber: Redis | null = null;
  private readonly listeners = new Set<RealtimeListener>();

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async onModuleInit(): Promise<void> {
    this.subscriber = this.redis.duplicate();
    this.subscriber.on('message', (_channel, message) => {
      this._handleMessage(message);
    });
    await this.subscriber.subscribe(CAR_TELEMETRY_UPDATES_CHANNEL);
    this.logger.log(
      `Subscribed to Redis channel ${CAR_TELEMETRY_UPDATES_CHANNEL}`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.subscriber) {
      return;
    }

    await this.subscriber.quit();
    this.subscriber = null;
  }

  onEvent(listener: RealtimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async publish(event: CarTelemetryRealtimeEvent): Promise<void> {
    await this.redis.publish(
      CAR_TELEMETRY_UPDATES_CHANNEL,
      JSON.stringify(event),
    );
  }

  private _handleMessage(message: string): void {
    let event: CarTelemetryRealtimeEvent;
    try {
      event = JSON.parse(message) as CarTelemetryRealtimeEvent;
    } catch {
      this.logger.warn('Ignoring invalid car-telemetry realtime payload');
      return;
    }

    if (!event?.companyId || !event?.type) {
      return;
    }

    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

export function companyCarTelemetryRoom(companyId: string): string {
  return `company:${companyId}:car-telemetry`;
}

export const INTERNAL_CAR_TELEMETRY_ROOM = 'internal:car-telemetry';
