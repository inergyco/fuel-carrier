import { applyDecorators, type Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
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
