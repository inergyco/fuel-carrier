import { AccessTokenService } from './access-token.service';

describe('AccessTokenService', () => {
  let service: AccessTokenService;
  let redisExists: jest.Mock;
  let redisSet: jest.Mock;

  beforeEach(() => {
    redisExists = jest.fn();
    redisSet = jest.fn().mockResolvedValue('OK');
    service = new AccessTokenService({
      exists: redisExists,
      set: redisSet,
    } as never);
  });

  describe('isRevoked', () => {
    it('treats a missing jti as revoked', async () => {
      await expect(service.isRevoked(undefined)).resolves.toBe(true);
      expect(redisExists).not.toHaveBeenCalled();
    });

    it('returns true when the jti is denylisted', async () => {
      redisExists.mockResolvedValue(1);
      await expect(service.isRevoked('jti-1')).resolves.toBe(true);
    });

    it('returns false when the jti is not denylisted', async () => {
      redisExists.mockResolvedValue(0);
      await expect(service.isRevoked('jti-1')).resolves.toBe(false);
    });

    it('fails closed when Redis errors', async () => {
      redisExists.mockRejectedValue(new Error('redis down'));
      await expect(service.isRevoked('jti-1')).resolves.toBe(true);
    });
  });

  describe('revoke', () => {
    it('stores the revoked jti with a TTL', async () => {
      await service.revoke('jti-1', undefined, 3600);
      expect(redisSet).toHaveBeenCalledWith(
        'auth-revoked:jti-1',
        '1',
        'EX',
        3600,
      );
    });

    it('rethrows when Redis cannot store the revocation', async () => {
      redisSet.mockRejectedValue(new Error('redis down'));
      await expect(service.revoke('jti-1', undefined, 3600)).rejects.toThrow(
        'redis down',
      );
    });
  });
});
