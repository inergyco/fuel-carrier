import {
  HttpStatus,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import Redis from 'ioredis';
import { createApiException } from '../common/exceptions/api.exception';
import { MqttBrokerService } from './mqtt-broker.service';

const MQTT_ACK_TIMEOUT_MS = 20_000;

export type MqttAckEvent = {
  carId: string;
  commandId: number;
};

type PendingMqttAck<TEvent extends MqttAckEvent> = {
  carId: string;
  resolve: (result: TEvent) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

export type MqttAckCommandOptions<TEvent extends MqttAckEvent> = {
  channel: string;
  /** Defaults to 20s, matching the truck ACK wait used by every command. */
  timeoutMs?: number;
  timeoutMessage: string;
  cancelledMessage: string;
  /** Log label, for example `output-ack` or `fuel-config-ack`. */
  label: string;
  isAckTopic: (topic: string) => boolean;
  parseAck: (topic: string, payload: Buffer) => TEvent | null;
  parseEvent: (raw: string | null | undefined) => TEvent | null;
};

/**
 * Shared MQTT command lifecycle: publish from the HTTP-handling instance,
 * wait for the truck ACK, and mirror that ACK over Redis because a `$share`
 * subscription may deliver it to another API instance.
 */
export abstract class MqttAckCommandService<TEvent extends MqttAckEvent>
  implements OnModuleInit, OnModuleDestroy
{
  protected readonly logger: Logger;
  private readonly timeoutMs: number;
  private readonly pendingByCommandId = new Map<
    number,
    PendingMqttAck<TEvent>
  >();
  private ackSubscriber: Redis | null = null;

  constructor(
    protected readonly broker: MqttBrokerService,
    private readonly redis: Redis,
    private readonly ack: MqttAckCommandOptions<TEvent>,
  ) {
    this.logger = new Logger(new.target.name);
    this.timeoutMs = ack.timeoutMs ?? MQTT_ACK_TIMEOUT_MS;
  }

  async onModuleInit(): Promise<void> {
    this.broker.addMessageHandler((topic, payload) => {
      void this._handleBrokerMessage(topic, payload);
    });

    this.ackSubscriber = this.redis.duplicate();
    this.ackSubscriber.on('message', (channel, message) => {
      if (channel !== this.ack.channel) {
        return;
      }
      this._resolveFromAckEvent(this.ack.parseEvent(message));
    });
    await this.ackSubscriber.subscribe(this.ack.channel);
    this.logger.log(`Subscribed to Redis channel ${this.ack.channel}`);
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.ackSubscriber) {
      return;
    }

    await this.ackSubscriber.quit();
    this.ackSubscriber = null;
  }

  protected assertBrokerConnected(): void {
    if (this.broker.isConnected) {
      return;
    }

    throw createApiException(
      HttpStatus.SERVICE_UNAVAILABLE,
      ApiErrorCode.INTERNAL_ERROR,
      'MQTT broker is not connected',
    );
  }

  protected waitForAck(options: {
    carId: string;
    commandId: number;
  }): Promise<TEvent> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingByCommandId.delete(options.commandId);
        reject(new Error(this.ack.timeoutMessage));
      }, this.timeoutMs);

      this.pendingByCommandId.set(options.commandId, {
        carId: options.carId,
        resolve,
        reject,
        timer,
      });
    });
  }

  protected cancelPending(commandId: number): void {
    const pending = this.pendingByCommandId.get(commandId);
    if (!pending) {
      return;
    }

    clearTimeout(pending.timer);
    this.pendingByCommandId.delete(commandId);
    pending.reject(new Error(this.ack.cancelledMessage));
  }

  private async _handleBrokerMessage(
    topic: string,
    payload: Buffer,
  ): Promise<void> {
    if (!this.ack.isAckTopic(topic)) {
      return;
    }

    const event = this.ack.parseAck(topic, payload);
    if (!event) {
      this.logger.debug(`Ignoring invalid ${this.ack.label} on ${topic}`);
      return;
    }

    // Resolve locally if this instance is waiting, then mirror for peers.
    this._resolveFromAckEvent(event);

    try {
      await this.redis.publish(this.ack.channel, JSON.stringify(event));
    } catch (error) {
      this.logger.error(
        `Failed to fan-out ${this.ack.label} commandId=${event.commandId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private _resolveFromAckEvent(event: TEvent | null): void {
    if (!event) {
      return;
    }

    const pending = this.pendingByCommandId.get(event.commandId);
    if (!pending) {
      return;
    }

    if (pending.carId !== event.carId) {
      this.logger.warn(
        `Ignoring ${this.ack.label} commandId=${event.commandId}: car mismatch`,
      );
      return;
    }

    clearTimeout(pending.timer);
    this.pendingByCommandId.delete(event.commandId);
    pending.resolve(event);
  }
}
