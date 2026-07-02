import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Response } from 'express';
import { CreateUrlDto, CreateUrlSchema } from './dto/create-url.dto.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ApiResponse } from '../../common/types/api-response.js';
import { IAnalyticsService } from '../analytics/interfaces/analytics.service.interface.js';

@Controller()
export class UrlsController {
  constructor(
    @Inject(IAnalyticsService)
    private readonly analyticsService: IAnalyticsService,
  ) {}

  @Post('shorten')
  @UseGuards(JwtAuthGuard)
  createUrl(
    @Body(new ZodValidationPipe(CreateUrlSchema)) dto: CreateUrlDto,
    @CurrentUser('id') userId: string,
  ): ApiResponse {
    return new ApiResponse('URL shortened successfully', {
      url: {
        id: '1',
        slug: 'stub123',
        originalUrl: dto.url,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  @Get(':slug')
  redirect(
    @Param('slug') slug: string,
    @Res({ passthrough: true }) res: Response,
  ): void {
    return res.redirect(302, `https://example.com/${slug}`);
  }

  @Get('urls/:id/stats')
  @UseGuards(JwtAuthGuard)
  async getStats(
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<ApiResponse> {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    const stats = await this.analyticsService.getStats(id, fromDate, toDate);
    return new ApiResponse('Analytics retrieved successfully', { stats });
  }

  @Delete('urls/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  deleteUrl(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): ApiResponse {
    void id;
    void userId;
    return new ApiResponse('URL deleted successfully');
  }
}
