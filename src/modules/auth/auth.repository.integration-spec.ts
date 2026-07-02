import { Test, TestingModule } from '@nestjs/testing';
import { AuthRepository } from './auth.repository';

describe('AuthRepository', () => {
  let repository: AuthRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthRepository],
    }).compile();

    repository = module.get(AuthRepository);
  });

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      const user = await repository.createUser({
        email: 'test@test.com',
        passwordHash: 'hashed-password',
        name: 'Test User',
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@test.com');
      expect(user.name).toBe('Test User');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      await repository.createUser({
        email: 'find@test.com',
        passwordHash: 'hashed-password',
        name: 'Find User',
      });

      const user = await repository.findByEmail('find@test.com');

      expect(user).not.toBeNull();
      expect(user!.email).toBe('find@test.com');
    });

    it('should return null for non-existent email', async () => {
      const user = await repository.findByEmail('nonexistent@test.com');
      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const created = await repository.createUser({
        email: 'byid@test.com',
        passwordHash: 'hashed-password',
        name: 'ById User',
      });

      const user = await repository.findById(created.id);

      expect(user).not.toBeNull();
      expect(user!.id).toBe(created.id);
    });

    it('should return null for non-existent id', async () => {
      const user = await repository.findById('999');
      expect(user).toBeNull();
    });
  });

  describe('findPasswordByEmail', () => {
    it('should return id and passwordHash', async () => {
      await repository.createUser({
        email: 'pwd@test.com',
        passwordHash: 'secret-hash',
        name: 'Pwd User',
      });

      const result = await repository.findPasswordByEmail('pwd@test.com');

      expect(result).not.toBeNull();
      expect(result!.id).toBeDefined();
      expect(result!.passwordHash).toBe('secret-hash');
    });

    it('should return null for non-existent email', async () => {
      const result = await repository.findPasswordByEmail('no@test.com');
      expect(result).toBeNull();
    });
  });

  describe('createRefreshToken', () => {
    it('should create and return a refresh token', async () => {
      const token = await repository.createRefreshToken({
        token: 'refresh-abc',
        userId: '1',
        expiresAt: new Date('2026-12-31'),
      });

      expect(token.id).toBeDefined();
      expect(token.token).toBe('refresh-abc');
      expect(token.userId).toBe('1');
      expect(token.revoked).toBe(false);
    });
  });

  describe('findRefreshToken', () => {
    it('should return token by value', async () => {
      await repository.createRefreshToken({
        token: 'find-token',
        userId: '1',
        expiresAt: new Date('2026-12-31'),
      });

      const found = await repository.findRefreshToken('find-token');

      expect(found).not.toBeNull();
      expect(found!.token).toBe('find-token');
    });

    it('should return null for non-existent token', async () => {
      const found = await repository.findRefreshToken('no-token');
      expect(found).toBeNull();
    });
  });

  describe('revokeRefreshToken', () => {
    it('should mark token as revoked', async () => {
      await repository.createRefreshToken({
        token: 'revoke-me',
        userId: '1',
        expiresAt: new Date('2026-12-31'),
      });

      await repository.revokeRefreshToken('revoke-me');

      const token = await repository.findRefreshToken('revoke-me');
      expect(token!.revoked).toBe(true);
    });
  });

  describe('revokeAllRefreshTokens', () => {
    it('should revoke all tokens for a user', async () => {
      await repository.createRefreshToken({
        token: 'user-token-1',
        userId: '99',
        expiresAt: new Date('2026-12-31'),
      });
      await repository.createRefreshToken({
        token: 'user-token-2',
        userId: '99',
        expiresAt: new Date('2026-12-31'),
      });

      await repository.revokeAllRefreshTokens('99');

      const t1 = await repository.findRefreshToken('user-token-1');
      const t2 = await repository.findRefreshToken('user-token-2');
      expect(t1!.revoked).toBe(true);
      expect(t2!.revoked).toBe(true);
    });
  });
});
