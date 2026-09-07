import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import type { Http2ServerRequest } from 'node:http2';
import type { FastifyRequest } from 'fastify';

export const REQUEST_ID_HEADER = 'x-request-id';

const ASSIGNED_REQUEST_ID = Symbol.for('fuel-carrier.assignedRequestId');

type RequestWithHeaders = IncomingMessage | Http2ServerRequest;

type RequestWithAssignedId = RequestWithHeaders & {
  [ASSIGNED_REQUEST_ID]?: string;
};

export function asHeaderValue(value: unknown): string | string[] | undefined {
  if (typeof value === 'string') {
    return value;
  }

  if (
    Array.isArray(value) &&
    value.every(function isString(entry): entry is string {
      return typeof entry === 'string';
    })
  ) {
    return value;
  }

  return undefined;
}

/** Prefer client-supplied id (tracing); otherwise mint one. */
export function resolveRequestId(
  headerValue: string | string[] | undefined,
): string {
  if (typeof headerValue === 'string') {
    const trimmed = headerValue.trim();
    if (trimmed.length > 0 && trimmed.length <= 128) {
      return trimmed;
    }
  }

  if (Array.isArray(headerValue) && headerValue[0]) {
    return resolveRequestId(headerValue[0]);
  }

  return randomUUID();
}

/**
 * One id per incoming HTTP message (shared by Fastify + Pino).
 * Safe to call multiple times — returns the same value.
 */
export function assignRequestId(req: RequestWithHeaders): string {
  const tagged = req as RequestWithAssignedId;
  const existing = tagged[ASSIGNED_REQUEST_ID];

  if (typeof existing === 'string' && existing.length > 0) {
    return existing;
  }

  const id = resolveRequestId(asHeaderValue(req.headers[REQUEST_ID_HEADER]));
  tagged[ASSIGNED_REQUEST_ID] = id;
  return id;
}

export function getRequestId(request: FastifyRequest): string {
  return typeof request.id === 'string' && request.id.length > 0
    ? request.id
    : 'unknown';
}
