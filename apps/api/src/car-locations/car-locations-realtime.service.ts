import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { CarLocationRealtimeEvent } from '@fuel-carrier/shared-types';
import Redis from 'ioredis';
import { REDIS } from '../redis/redis.tokens';

export const CAR_LOCATION_UPDATES_CHANNEL = 'car-location-updates';

type RealtimeListener = (event: CarLocationRealtimeEvent) => void;

/**
 * Cross-process fan-out for live map updates via Redis pub/sub.
 * Any API instance can publish; every instance notifies its local WS clients.
 */
@Injectable()
export class CarLocationsRealtimeService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(CarLocationsRealtimeService.name);
  private subscriber: Redis | null = null;
  private readonly listeners = new Set<RealtimeListener>();

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async onModuleInit(): Promise<void> {
    this.subscriber = this.redis.duplicate();
    this.subscriber.on('message', (_channel, message) => {
      this._handleMessage(message);
    });
    await this.subscriber.subscribe(CAR_LOCATION_UPDATES_CHANNEL);
    this.logger.log(
      `Subscribed to Redis channel ${CAR_LOCATION_UPDATES_CHANNEL}`,
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

  async publish(event: CarLocationRealtimeEvent): Promise<void> {
    await this.redis.publish(
      CAR_LOCATION_UPDATES_CHANNEL,
      JSON.stringify(event),
    );
  }

  private _handleMessage(message: string): void {
    let event: CarLocationRealtimeEvent;
    try {
      event = JSON.parse(message) as CarLocationRealtimeEvent;
    } catch {
      this.logger.warn('Ignoring invalid car-location realtime payload');
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

export function companyCarLocationsRoom(companyId: string): string {
  return `company:${companyId}:car-locations`;
}
