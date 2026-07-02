import { ClickEvent, ClickStats } from './analytics.repository.interface';

export const IAnalyticsService = Symbol('IAnalyticsService');

export interface IAnalyticsService {
  recordClick(
    urlId: string,
    referrer?: string,
    userAgent?: string,
  ): Promise<ClickEvent>;
  getStats(urlId: string, from?: Date, to?: Date): Promise<ClickStats>;
}
