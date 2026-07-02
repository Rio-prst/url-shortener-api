import { Injectable } from '@nestjs/common';
import {
  IAuthService,
  AuthUser,
  AuthTokens,
} from './interfaces/auth.service.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// TODO: implement with bcrypt + jwt
@Injectable()
export class AuthService implements IAuthService {
  register(dto: RegisterDto): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    void dto;
    return Promise.resolve({
      user: {
        id: '',
        email: '',
        name: '',
        createdAt: new Date(0),
        updatedAt: new Date(0),
      },
      tokens: { accessToken: '', refreshToken: '' },
    });
  }

  login(dto: LoginDto): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    void dto;
    return Promise.resolve({
      user: {
        id: '',
        email: '',
        name: '',
        createdAt: new Date(0),
        updatedAt: new Date(0),
      },
      tokens: { accessToken: '', refreshToken: '' },
    });
  }

  me(userId: string): Promise<AuthUser> {
    void userId;
    return Promise.resolve({
      id: '',
      email: '',
      name: '',
      createdAt: new Date(0),
      updatedAt: new Date(0),
    });
  }

  rotate(refreshToken: string): Promise<AuthTokens> {
    void refreshToken;
    return Promise.resolve({ accessToken: '', refreshToken: '' });
  }

  logout(refreshToken: string): Promise<void> {
    void refreshToken;
    return Promise.resolve();
  }
}
