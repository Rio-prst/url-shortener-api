import { Injectable, Inject } from '@nestjs/common';
import { IAnalyticsRepository } from './interfaces/analytics.repository.interface';
import { IAnalyticsService } from './interfaces/analytics.service.interface';
import {
  ClickEvent,
  ClickStats,
} from './interfaces/analytics.repository.interface';

@Injectable()
export class AnalyticsService implements IAnalyticsService {
  constructor(
    @Inject(IAnalyticsRepository)
    private readonly analyticsRepository: IAnalyticsRepository,
  ) {}

  async recordClick(
    urlId: string,
    referrer?: string,
    userAgent?: string,
  ): Promise<ClickEvent> {
    return this.analyticsRepository.recordClick({ urlId, referrer, userAgent });
  }

  async getStats(urlId: string, from?: Date, to?: Date): Promise<ClickStats> {
    return this.analyticsRepository.getStats(urlId, from, to);
  }
}
