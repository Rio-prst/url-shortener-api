import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService],
    }).compile();

    service = module.get(CacheService);
  });

  describe('isConnected', () => {
    it('should return false when not connected', () => {
      expect(service.isConnected()).toBe(false);
    });
  });

  describe('get', () => {
    it('should return null when not connected', async () => {
      const result = await service.get('key');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should not throw when not connected', async () => {
      await expect(service.set('key', 'value')).resolves.not.toThrow();
    });
  });

  describe('del', () => {
    it('should not throw when not connected', async () => {
      await expect(service.del('key')).resolves.not.toThrow();
    });
  });
});
