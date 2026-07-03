import { Test, TestingModule } from '@nestjs/testing';
import { UrlsRepository } from './urls.repository';

describe('UrlsRepository', () => {
  let repository: UrlsRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UrlsRepository],
    }).compile();

    repository = module.get(UrlsRepository);
  });

  describe('createUrl', () => {
    it('should create url with userId', async () => {
      const url = await repository.createUrl({
        slug: 'create-with-user',
        originalUrl: 'https://example.com/1',
        userId: '1',
      });

      expect(url.id).toBeDefined();
      expect(url.slug).toBe('create-with-user');
      expect(url.originalUrl).toBe('https://example.com/1');
      expect(url.userId).toBe('1');
      expect(url.createdAt).toBeInstanceOf(Date);
      expect(url.updatedAt).toBeInstanceOf(Date);
    });

    it('should create url without userId', async () => {
      const url = await repository.createUrl({
        slug: 'create-no-user',
        originalUrl: 'https://example.com/2',
      });

      expect(url.id).toBeDefined();
      expect(url.slug).toBe('create-no-user');
      expect(url.userId).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should return url by slug', async () => {
      await repository.createUrl({
        slug: 'find-by-slug',
        originalUrl: 'https://example.com/find',
        userId: '1',
      });

      const url = await repository.findBySlug('find-by-slug');

      expect(url).not.toBeNull();
      expect(url!.slug).toBe('find-by-slug');
      expect(url!.originalUrl).toBe('https://example.com/find');
    });

    it('should return null for non-existent slug', async () => {
      const url = await repository.findBySlug('non-existent-slug');
      expect(url).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return url by id', async () => {
      const created = await repository.createUrl({
        slug: 'find-by-id',
        originalUrl: 'https://example.com/id',
        userId: '1',
      });

      const url = await repository.findById(created.id);

      expect(url).not.toBeNull();
      expect(url!.id).toBe(created.id);
      expect(url!.slug).toBe('find-by-id');
    });

    it('should return null for non-existent id', async () => {
      const url = await repository.findById('99999');
      expect(url).toBeNull();
    });
  });

  describe('slugExists', () => {
    it('should return true for existing slug', async () => {
      await repository.createUrl({
        slug: 'slug-exists',
        originalUrl: 'https://example.com/exists',
        userId: '1',
      });

      const exists = await repository.slugExists('slug-exists');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent slug', async () => {
      const exists = await repository.slugExists('non-existent-slug');
      expect(exists).toBe(false);
    });
  });

  describe('deleteUrl', () => {
    it('should delete url by id', async () => {
      const created = await repository.createUrl({
        slug: 'delete-me',
        originalUrl: 'https://example.com/delete',
        userId: '1',
      });

      await repository.deleteUrl(created.id);

      const url = await repository.findById(created.id);
      expect(url).toBeNull();
    });
  });
});
