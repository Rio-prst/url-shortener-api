import { Injectable } from '@nestjs/common';
import {
  IAuthRepository,
  CreateUserInput,
  User,
  CreateRefreshTokenInput,
  RefreshToken,
} from './interfaces/auth.repository.interface';

// TODO: implement with Prisma TypedSQL
@Injectable()
export class AuthRepository implements IAuthRepository {
  createUser(data: CreateUserInput): Promise<User> {
    void data;
    return Promise.resolve({
      id: '',
      email: '',
      name: '',
      createdAt: new Date(0),
      updatedAt: new Date(0),
    });
  }

  findByEmail(email: string): Promise<User | null> {
    void email;
    return Promise.resolve(null);
  }

  findById(id: string): Promise<User | null> {
    void id;
    return Promise.resolve(null);
  }

  findPasswordByEmail(
    email: string,
  ): Promise<{ id: string; passwordHash: string } | null> {
    void email;
    return Promise.resolve(null);
  }

  createRefreshToken(data: CreateRefreshTokenInput): Promise<RefreshToken> {
    void data;
    return Promise.resolve({
      id: '',
      token: '',
      userId: '',
      expiresAt: new Date(0),
      revoked: false,
      createdAt: new Date(0),
    });
  }

  findRefreshToken(token: string): Promise<RefreshToken | null> {
    void token;
    return Promise.resolve(null);
  }

  revokeRefreshToken(token: string): Promise<void> {
    void token;
    return Promise.resolve();
  }

  revokeAllRefreshTokens(userId: string): Promise<void> {
    void userId;
    return Promise.resolve();
  }
}
