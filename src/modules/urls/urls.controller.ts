import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CreateUrlDto } from './dto/create-url.dto.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ApiResponse } from '../../common/types/api-response.js';
import { IAnalyticsService } from '../analytics/interfaces/analytics.service.interface.js';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@ApiTags('URLs')
@Controller()
export class UrlsController {
  constructor(
    @Inject(IAnalyticsService)
    private readonly analyticsService: IAnalyticsService,
    @InjectQueue('click-events')
    private readonly clickQueue: Queue,
  ) {}

  @Post('shorten')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a shortened URL' })
  @ApiBody({ type: CreateUrlDto })
  @SwaggerApiResponse({
    status: 201,
    description: 'URL shortened successfully',
  })
  @SwaggerApiResponse({ status: 400, description: 'Validation failed' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  @SwaggerApiResponse({ status: 409, description: 'Slug already exists' })
  createUrl(
    @Body(new ZodValidationPipe(CreateUrlDto.schema)) dto: CreateUrlDto,
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
  @ApiOperation({ summary: 'Redirect to original URL' })
  @SwaggerApiResponse({ status: 302, description: 'Redirect to original URL' })
  @SwaggerApiResponse({ status: 404, description: 'URL not found' })
  async redirect(
    @Param('slug') slug: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<void> {
    const referrer = req.headers.referer;
    const userAgent = req.headers['user-agent'];
    await this.clickQueue.add('record-click', {
      urlId: 'stub-id',
      referrer: typeof referrer === 'string' ? referrer : undefined,
      userAgent: typeof userAgent === 'string' ? userAgent : undefined,
    });
    return res.redirect(302, `https://example.com/${slug}`);
  }

  @Get('urls/:id/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get click analytics for a URL' })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start date (ISO 8601)',
  })
  @ApiQuery({ name: 'to', required: false, description: 'End date (ISO 8601)' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully',
  })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a shortened URL' })
  @SwaggerApiResponse({ status: 200, description: 'URL deleted successfully' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  @SwaggerApiResponse({ status: 403, description: 'You do not own this URL' })
  @SwaggerApiResponse({ status: 404, description: 'URL not found' })
  deleteUrl(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): ApiResponse {
    void id;
    void userId;
    return new ApiResponse('URL deleted successfully');
  }
}
