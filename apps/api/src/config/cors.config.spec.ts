import {
  DEV_CORS_ALLOWED_ORIGINS,
  parseCorsAllowedOrigins,
} from './cors.config';

describe('parseCorsAllowedOrigins', () => {
  it('splits comma-separated origins and trims whitespace', () => {
    expect(
      parseCorsAllowedOrigins(
        ' https://admin.example.com , https://app.example.com ',
      ),
    ).toEqual(['https://admin.example.com', 'https://app.example.com']);
  });

  it('returns an empty array when the value is blank', () => {
    expect(parseCorsAllowedOrigins(undefined)).toEqual([]);
    expect(parseCorsAllowedOrigins('   ')).toEqual([]);
  });
});

describe('DEV_CORS_ALLOWED_ORIGINS', () => {
  it('includes both local panel dev servers', () => {
    expect(DEV_CORS_ALLOWED_ORIGINS).toEqual(
      expect.arrayContaining([
        'http://localhost:5173',
        'http://localhost:5174',
      ]),
    );
  });
});
