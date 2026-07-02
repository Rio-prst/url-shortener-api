import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RegisterDto, RegisterSchema } from './dto/register.dto.js';
import { LoginDto, LoginSchema } from './dto/login.dto.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ApiResponse } from '../../common/types/api-response.js';

@Controller('auth')
export class AuthController {
  @Post('register')
  register(
    @Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto,
  ): ApiResponse {
    return new ApiResponse('User registered successfully', {
      user: { id: '1', email: dto.email, name: dto.name },
      accessToken: 'stub-access-token',
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): ApiResponse {
    res.cookie('refresh_token', 'stub-refresh-token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return new ApiResponse('Login successful', {
      user: { id: '1', email: dto.email, name: 'Stub User' },
      accessToken: 'stub-access-token',
    });
  }

  @Post('rotate')
  @HttpCode(HttpStatus.OK)
  rotate(@Req() req: Request): ApiResponse {
    void req;
    return new ApiResponse('Token rotated successfully', {
      accessToken: 'stub-new-access-token',
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): ApiResponse {
    void req;
    res.clearCookie('refresh_token', { path: '/' });
    return new ApiResponse('Logged out successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser('id') userId: string): ApiResponse {
    return new ApiResponse('User retrieved successfully', {
      user: { id: userId, email: 'stub@test.com', name: 'Stub User' },
    });
  }
}
