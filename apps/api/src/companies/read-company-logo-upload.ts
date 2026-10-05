import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import type { FastifyRequest } from 'fastify';
import { createApiException } from '../common/exceptions/api.exception';
import { COMPANY_LOGO_MAX_BYTES } from './company-logo.constants';
import {
  InvalidCompanyLogoError,
  saveCompanyLogo,
} from './company-logo-storage';

export async function readCompanyLogoUpload(
  request: FastifyRequest,
): Promise<string> {
  try {
    const uploaded = await request.file({
      limits: { fileSize: COMPANY_LOGO_MAX_BYTES },
    });

    if (!uploaded || uploaded.fieldname !== 'file') {
      throw createApiException(
        HttpStatus.BAD_REQUEST,
        ApiErrorCode.VALIDATION_ERROR,
        'Choose an image to upload',
      );
    }

    const buffer = await uploaded.toBuffer();

    if (buffer.length === 0 || buffer.length > COMPANY_LOGO_MAX_BYTES) {
      throw logoTooLargeException();
    }

    return await saveCompanyLogo({
      buffer,
      declaredMimeType: uploaded.mimetype,
    });
  } catch (error) {
    if (error instanceof InvalidCompanyLogoError) {
      throw createApiException(
        HttpStatus.BAD_REQUEST,
        ApiErrorCode.VALIDATION_ERROR,
        error.message,
      );
    }

    if (isFileTooLargeError(error)) {
      throw logoTooLargeException();
    }

    if (isInvalidMultipartError(error)) {
      throw createApiException(
        HttpStatus.BAD_REQUEST,
        ApiErrorCode.VALIDATION_ERROR,
        'Choose an image to upload',
      );
    }

    throw error;
  }
}

function logoTooLargeException() {
  return createApiException(
    HttpStatus.BAD_REQUEST,
    ApiErrorCode.VALIDATION_ERROR,
    'Logo must be 2 MB or smaller',
  );
}

function isFileTooLargeError(error: unknown): boolean {
  const code = readErrorCode(error);
  return (
    code === 'FST_REQ_FILE_TOO_LARGE' || code === 'FST_ERR_CTP_BODY_TOO_LARGE'
  );
}

function isInvalidMultipartError(error: unknown): boolean {
  return readErrorCode(error) === 'FST_INVALID_MULTIPART_CONTENT_TYPE';
}

function readErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return undefined;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : undefined;
}
