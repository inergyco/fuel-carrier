import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { detectImageUploadExtension } from './image-file';

const STORED_IMAGE_FILE_NAME =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|webp|gif|svg)$/i;

export type ImageStorageOptions = {
  /** Directory name under `uploads/`, e.g. `company-logos`. */
  folderName: string;
  /** Public URL prefix including `/api`, e.g. `/api/uploads/company-logos`. */
  publicPrefix: string;
  /** Message when magic-byte / MIME validation fails. */
  invalidMessage: string;
};

export type ImageStorage = {
  getDirectory: () => string;
  ensureDirectory: () => Promise<void>;
  save: (options: {
    buffer: Buffer;
    declaredMimeType: string;
  }) => Promise<string>;
  removeStored: (imageUrl: string | null | undefined) => Promise<void>;
  InvalidImageError: new () => Error;
};

export function createImageStorage(options: ImageStorageOptions): ImageStorage {
  const { folderName, publicPrefix, invalidMessage } = options;

  class InvalidImageError extends Error {
    constructor() {
      super(invalidMessage);
      this.name = 'InvalidImageError';
    }
  }

  function getDirectory(): string {
    return path.join(process.cwd(), 'uploads', folderName);
  }

  async function ensureDirectory(): Promise<void> {
    await mkdir(getDirectory(), { recursive: true });
  }

  async function save(saveOptions: {
    buffer: Buffer;
    declaredMimeType: string;
  }): Promise<string> {
    const extension = detectImageUploadExtension(
      saveOptions.buffer,
      saveOptions.declaredMimeType,
    );

    if (!extension) {
      throw new InvalidImageError();
    }

    await ensureDirectory();
    const fileName = `${randomUUID()}.${extension}`;
    await writeFile(path.join(getDirectory(), fileName), saveOptions.buffer);
    return `${publicPrefix}/${fileName}`;
  }

  async function removeStored(
    imageUrl: string | null | undefined,
  ): Promise<void> {
    const fileName = getStoredImageFileName(imageUrl);

    if (!fileName) {
      return;
    }

    await unlink(path.join(getDirectory(), fileName)).catch(
      function ignoreMissingImage() {
        return undefined;
      },
    );
  }

  function getStoredImageFileName(
    imageUrl: string | null | undefined,
  ): string | null {
    if (!imageUrl?.startsWith(`${publicPrefix}/`)) {
      return null;
    }

    const fileName = imageUrl.slice(publicPrefix.length + 1);

    if (
      fileName !== path.basename(fileName) ||
      !STORED_IMAGE_FILE_NAME.test(fileName)
    ) {
      return null;
    }

    return fileName;
  }

  return {
    getDirectory,
    ensureDirectory,
    save,
    removeStored,
    InvalidImageError,
  };
}
