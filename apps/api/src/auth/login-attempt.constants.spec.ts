import {
  loginAttemptKeys,
  loginPortalFromPath,
  usernameFromLoginBody,
} from './login-attempt.constants';

describe('login-attempt helpers', () => {
  it('scopes keys by portal, IP, and username', () => {
    expect(loginAttemptKeys('internal', '1.2.3.4', 'admin')).toEqual({
      ip: 'login-attempts:internal:ip:1.2.3.4',
      user: 'login-attempts:internal:user:admin',
    });
  });

  it('reads the portal from the request path', () => {
    expect(loginPortalFromPath('/api/external/auth/login')).toBe('external');
    expect(loginPortalFromPath('/api/internal/auth/login')).toBe('internal');
  });

  it('reads a non-empty username from the body', () => {
    expect(usernameFromLoginBody({ username: '  admin  ' })).toBe('admin');
    expect(usernameFromLoginBody({ username: '   ' })).toBeNull();
    expect(usernameFromLoginBody(null)).toBeNull();
  });
});
