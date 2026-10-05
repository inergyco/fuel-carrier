import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { COMPANY_LOGO_PUBLIC_PREFIX } from './company-logo.constants';
import { detectCompanyLogoExtension } from './company-logo-file';

const STORED_LOGO_FILE_NAME =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|webp|gif|svg)$/i;

export function getCompanyLogoDirectory(): string {
  return path.join(process.cwd(), 'uploads', 'company-logos');
}

export async function ensureCompanyLogoDirectory(): Promise<void> {
  await mkdir(getCompanyLogoDirectory(), { recursive: true });
}

export async function saveCompanyLogo(options: {
  buffer: Buffer;
  declaredMimeType: string;
}): Promise<string> {
  const extension = detectCompanyLogoExtension(
    options.buffer,
    options.declaredMimeType,
  );

  if (!extension) {
    throw new InvalidCompanyLogoError();
  }

  await ensureCompanyLogoDirectory();
  const fileName = `${randomUUID()}.${extension}`;
  await writeFile(
    path.join(getCompanyLogoDirectory(), fileName),
    options.buffer,
  );
  return `${COMPANY_LOGO_PUBLIC_PREFIX}/${fileName}`;
}

export async function removeStoredCompanyLogo(
  logoUrl: string | null | undefined,
): Promise<void> {
  const fileName = getStoredLogoFileName(logoUrl);

  if (!fileName) {
    return;
  }

  await unlink(path.join(getCompanyLogoDirectory(), fileName)).catch(
    function ignoreMissingLogo() {
      return undefined;
    },
  );
}

export class InvalidCompanyLogoError extends Error {
  constructor() {
    super('Logo must be a PNG, JPG, WEBP, GIF, or SVG image');
    this.name = 'InvalidCompanyLogoError';
  }
}

function getStoredLogoFileName(
  logoUrl: string | null | undefined,
): string | null {
  if (!logoUrl?.startsWith(`${COMPANY_LOGO_PUBLIC_PREFIX}/`)) {
    return null;
  }

  const fileName = logoUrl.slice(COMPANY_LOGO_PUBLIC_PREFIX.length + 1);

  if (
    fileName !== path.basename(fileName) ||
    !STORED_LOGO_FILE_NAME.test(fileName)
  ) {
    return null;
  }

  return fileName;
}
