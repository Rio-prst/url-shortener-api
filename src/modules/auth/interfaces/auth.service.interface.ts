import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const IAuthService = Symbol('IAuthService');

export interface IAuthService {
  register(dto: RegisterDto): Promise<{ user: AuthUser; tokens: AuthTokens }>;
  login(dto: LoginDto): Promise<{ user: AuthUser; tokens: AuthTokens }>;
  me(userId: string): Promise<AuthUser>;
  rotate(refreshToken: string): Promise<AuthTokens>;
  logout(refreshToken: string): Promise<void>;
}
