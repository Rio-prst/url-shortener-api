import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('User registered successfully');
          expect(res.body.data.user.email).toBe('test@test.com');
          expect(res.body.data.accessToken).toBeDefined();
        });
    });

    it('should reject duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(409);
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        })
        .expect(400);
    });

    it('should reject weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test2@test.com',
          password: '123',
          name: 'Test User',
        })
        .expect(400);
    });

    it('should reject empty body', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Login successful');
          expect(res.body.data.accessToken).toBeDefined();
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    let accessToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'test@test.com',
        password: 'password123',
      });
      accessToken = res.body.data.accessToken;
    });

    it('should return current user', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.user.email).toBe('test@test.com');
        });
    });

    it('should reject without token', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should reject invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
