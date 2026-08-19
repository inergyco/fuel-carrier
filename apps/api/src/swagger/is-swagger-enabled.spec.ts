import { isSwaggerEnabled } from './is-swagger-enabled';

describe('isSwaggerEnabled', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(function restoreNodeEnv() {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('is off in production even when the env flag is true', () => {
    process.env.NODE_ENV = 'production';
    expect(isSwaggerEnabled('true')).toBe(false);
  });

  it('follows the env flag outside production', () => {
    process.env.NODE_ENV = 'development';
    expect(isSwaggerEnabled('true')).toBe(true);
    expect(isSwaggerEnabled('false')).toBe(false);
  });

  it('defaults to on outside production when the flag is omitted', () => {
    process.env.NODE_ENV = 'development';
    expect(isSwaggerEnabled()).toBe(true);
  });
});
