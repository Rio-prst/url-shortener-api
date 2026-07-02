import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject } from '@nestjs/common';
import { IAuthRepository } from '../interfaces/auth.repository.interface.js';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(IAuthRepository) private readonly authRepository: IAuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
    });
  }

  async validate(
    payload: JwtPayload,
  ): Promise<{ id: string; email: string; name: string }> {
    const user = await this.authRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException({
        code: 'auth.unauthorized',
        message: 'User not found',
      });
    }

    return { id: user.id, email: user.email, name: user.name };
  }
}
