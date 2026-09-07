import type { Options as PinoHttpOptions } from 'pino-http';
import { isHealthProbeRequest } from '../health-probe.utils';
import { assignRequestId } from './request-id';

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null) {
    return value as Record<string, unknown>;
  }

  return {};
}

/**
 * Shared Pino HTTP options for nestjs-pino.
 * JSON in production; pretty multi-line logs in local/dev.
 */
export function createPinoHttpOptions(options: {
  level: string;
  isProduction: boolean;
}): PinoHttpOptions {
  return {
    level: options.level,
    genReqId: assignRequestId,
    customProps: function customProps(req) {
      return {
        requestId: assignRequestId(req),
      };
    },
    transport: options.isProduction
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            colorize: true,
            translateTime: 'SYS:standard',
          },
        },
    autoLogging: {
      ignore: function ignoreHealthProbes(req) {
        const url = req.url ?? '';
        return isHealthProbeRequest(url);
      },
    },
    serializers: {
      req: function serializeReq(req) {
        const record = asRecord(req);
        return {
          id: record.id,
          method: record.method,
          url: record.url,
        };
      },
      res: function serializeRes(res) {
        const record = asRecord(res);
        return {
          statusCode: record.statusCode,
        };
      },
    },
  };
}
