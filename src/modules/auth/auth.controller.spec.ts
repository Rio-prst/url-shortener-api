import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get(AuthController);
  });

  describe('register', () => {
    it('should register a new user', () => {
      const dto = {
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
      };

      const result = controller.register(dto);

      expect(result.message).toBe('User registered successfully');
      expect(result.data).toBeDefined();
    });
  });

  describe('login', () => {
    it('should login with valid credentials', () => {
      const dto = { email: 'test@test.com', password: 'password123' };

      const result = controller.login(dto, { cookie: jest.fn() } as never);

      expect(result.message).toBe('Login successful');
      expect(result.data).toBeDefined();
    });
  });

  describe('me', () => {
    it('should return current user', () => {
      const result = controller.me('1');

      expect(result.message).toBe('User retrieved successfully');
      expect(result.data).toBeDefined();
    });
  });
});
