export type CompanyLogoExtension = 'png' | 'jpg' | 'webp' | 'gif' | 'svg';

const RASTER_SIGNATURES: Array<{
  extension: Exclude<CompanyLogoExtension, 'svg'>;
  matches: (buffer: Buffer) => boolean;
}> = [
  {
    extension: 'png',
    matches: function isPng(buffer) {
      return buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    },
  },
  {
    extension: 'jpg',
    matches: function isJpeg(buffer) {
      return (
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
      );
    },
  },
  {
    extension: 'gif',
    matches: function isGif(buffer) {
      const header = buffer.subarray(0, 6).toString('ascii');
      return header === 'GIF87a' || header === 'GIF89a';
    },
  },
  {
    extension: 'webp',
    matches: function isWebp(buffer) {
      return (
        buffer.length >= 12 &&
        buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP'
      );
    },
  },
];

/** Identify a logo from its bytes. SVG also requires an image/svg+xml content type. */
export function detectCompanyLogoExtension(
  buffer: Buffer,
  declaredMimeType: string,
): CompanyLogoExtension | null {
  for (const signature of RASTER_SIGNATURES) {
    if (signature.matches(buffer)) {
      return signature.extension;
    }
  }

  if (declaredMimeType === 'image/svg+xml' && isSafeSvg(buffer)) {
    return 'svg';
  }

  return null;
}

function isSafeSvg(buffer: Buffer): boolean {
  const text = buffer.toString('utf8').trim();

  if (text.length === 0 || text.includes('\0')) {
    return false;
  }

  if (!/<svg[\s>]/i.test(text)) {
    return false;
  }

  if (
    /<script[\s>]/i.test(text) ||
    /javascript:/i.test(text) ||
    /\son[a-z]+\s*=/i.test(text)
  ) {
    return false;
  }

  return true;
}
