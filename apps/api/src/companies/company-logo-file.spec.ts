import { detectCompanyLogoExtension } from './company-logo-file';

describe('detectCompanyLogoExtension', () => {
  it('recognizes a PNG signature', () => {
    const buffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
    ]);

    expect(detectCompanyLogoExtension(buffer, 'application/octet-stream')).toBe(
      'png',
    );
  });

  it('accepts a plain SVG and rejects one with a script', () => {
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
      'utf8',
    );
    const scripted = Buffer.from(
      '<svg><script>alert(1)</script></svg>',
      'utf8',
    );

    expect(detectCompanyLogoExtension(svg, 'image/svg+xml')).toBe('svg');
    expect(detectCompanyLogoExtension(scripted, 'image/svg+xml')).toBeNull();
    expect(detectCompanyLogoExtension(svg, 'text/plain')).toBeNull();
  });
});
