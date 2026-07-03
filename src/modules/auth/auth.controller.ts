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
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ApiResponse } from '../../common/types/api-response.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @SwaggerApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @SwaggerApiResponse({ status: 400, description: 'Validation failed' })
  @SwaggerApiResponse({ status: 409, description: 'Email already registered' })
  register(
    @Body(new ZodValidationPipe(RegisterDto.schema)) dto: RegisterDto,
  ): ApiResponse {
    return new ApiResponse('User registered successfully', {
      user: { id: '1', email: dto.email, name: dto.name },
      accessToken: 'stub-access-token',
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @SwaggerApiResponse({ status: 200, description: 'Login successful' })
  @SwaggerApiResponse({ status: 400, description: 'Validation failed' })
  @SwaggerApiResponse({ status: 401, description: 'Invalid email or password' })
  login(
    @Body(new ZodValidationPipe(LoginDto.schema)) dto: LoginDto,
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
  @ApiOperation({ summary: 'Rotate refresh token' })
  @ApiCookieAuth()
  @SwaggerApiResponse({
    status: 200,
    description: 'Token rotated successfully',
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Invalid/revoked/expired refresh token',
  })
  rotate(@Req() req: Request): ApiResponse {
    void req;
    return new ApiResponse('Token rotated successfully', {
      accessToken: 'stub-new-access-token',
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiCookieAuth()
  @SwaggerApiResponse({ status: 200, description: 'Logged out successfully' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @SwaggerApiResponse({
    status: 200,
    description: 'User retrieved successfully',
  })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  me(@CurrentUser('id') userId: string): ApiResponse {
    return new ApiResponse('User retrieved successfully', {
      user: { id: userId, email: 'stub@test.com', name: 'Stub User' },
    });
  }
}
