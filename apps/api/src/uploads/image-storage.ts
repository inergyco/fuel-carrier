import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  detectImageUploadExtension,
  type ImageUploadExtension,
} from './image-file';

const STORED_IMAGE_FILE_NAME =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|webp|gif|svg)$/i;

const CONTENT_TYPE_BY_EXTENSION: Record<ImageUploadExtension, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

export type ImageObjectStore = {
  put: (options: {
    key: string;
    body: Buffer;
    contentType: string;
  }) => Promise<void>;
  delete: (key: string) => Promise<void>;
};

export type ImageStorageOptions = {
  /** Directory / object-key prefix, e.g. `company-logos`. */
  folderName: string;
  /** Stable API path prefix, e.g. `/api/uploads/company-logos`. */
  publicPrefix: string;
  /** Message when magic-byte / MIME validation fails. */
  invalidMessage: string;
  /** When set, save/delete use object storage instead of local disk. */
  objectStore?: ImageObjectStore | null;
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
  const {
    folderName,
    publicPrefix,
    invalidMessage,
    objectStore = null,
  } = options;

  class InvalidImageError extends Error {
    constructor() {
      super(invalidMessage);
      this.name = 'InvalidImageError';
    }
  }

  function getDirectory(): string {
    return path.join(process.cwd(), 'uploads', folderName);
  }

  function toObjectKey(fileName: string): string {
    return `${folderName}/${fileName}`;
  }

  async function ensureDirectory(): Promise<void> {
    if (objectStore) {
      return;
    }

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

    const fileName = `${randomUUID()}.${extension}`;

    if (objectStore) {
      await objectStore.put({
        key: toObjectKey(fileName),
        body: saveOptions.buffer,
        contentType: CONTENT_TYPE_BY_EXTENSION[extension],
      });
    } else {
      await ensureDirectory();
      await writeFile(path.join(getDirectory(), fileName), saveOptions.buffer);
    }

    return `${publicPrefix}/${fileName}`;
  }

  async function removeStored(
    imageUrl: string | null | undefined,
  ): Promise<void> {
    const fileName = getStoredImageFileName(imageUrl);

    if (!fileName) {
      return;
    }

    if (objectStore) {
      await objectStore
        .delete(toObjectKey(fileName))
        .catch(function ignoreMissingImage() {
          return undefined;
        });
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
