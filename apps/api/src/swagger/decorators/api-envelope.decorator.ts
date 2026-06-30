import { applyDecorators, type Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiErrorBodyDto } from '../dto/api-error.dto';

export function ApiEnvelopeOkResponse<T extends Type>(model: T) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        type: 'object',
        required: ['data'],
        properties: {
          data: { $ref: getSchemaPath(model) },
        },
      },
    }),
  );
}

export function ApiEnvelopeOkListResponse<T extends Type>(model: T) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        type: 'object',
        required: ['data'],
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
        },
      },
    }),
  );
}

export function ApiEnvelopeOkPaginatedResponse<T extends Type>(model: T) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        type: 'object',
        required: ['data'],
        properties: {
          data: {
            type: 'object',
            required: ['items', 'page', 'limit', 'totalItems', 'totalPages'],
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 10 },
              totalItems: { type: 'integer', example: 42 },
              totalPages: { type: 'integer', example: 3 },
            },
          },
        },
      },
    }),
  );
}

export function ApiEnvelopeUnauthorizedResponse() {
  return applyDecorators(
    ApiExtraModels(ApiErrorBodyDto),
    ApiUnauthorizedResponse({
      schema: {
        type: 'object',
        required: ['error'],
        properties: {
          error: { $ref: getSchemaPath(ApiErrorBodyDto) },
        },
      },
    }),
  );
}

export function ApiEnvelopeBadRequestResponse() {
  return applyDecorators(
    ApiExtraModels(ApiErrorBodyDto),
    ApiBadRequestResponse({
      schema: {
        type: 'object',
        required: ['error'],
        properties: {
          error: { $ref: getSchemaPath(ApiErrorBodyDto) },
        },
      },
    }),
  );
}

export function ApiEnvelopeNotFoundResponse() {
  return applyDecorators(
    ApiExtraModels(ApiErrorBodyDto),
    ApiNotFoundResponse({
      schema: {
        type: 'object',
        required: ['error'],
        properties: {
          error: { $ref: getSchemaPath(ApiErrorBodyDto) },
        },
      },
    }),
  );
}
