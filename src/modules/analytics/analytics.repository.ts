import { Injectable } from '@nestjs/common';
import {
  IAnalyticsRepository,
  RecordClickInput,
  ClickEvent,
  ClickStats,
} from './interfaces/analytics.repository.interface';

// TODO: implement with Prisma TypedSQL
@Injectable()
export class AnalyticsRepository implements IAnalyticsRepository {
  recordClick(data: RecordClickInput): Promise<ClickEvent> {
    void data;
    return Promise.resolve({
      id: '',
      urlId: '',
      timestamp: new Date(0),
      referrer: null,
    });
  }

  getTotalClicks(urlId: string): Promise<number> {
    void urlId;
    return Promise.resolve(0);
  }

  getClicksByDate(
    urlId: string,
    from?: Date,
    to?: Date,
  ): Promise<Array<{ date: string; count: number }>> {
    void urlId;
    void from;
    void to;
    return Promise.resolve([]);
  }

  getClicksByReferrer(
    urlId: string,
  ): Promise<Array<{ referrer: string; count: number }>> {
    void urlId;
    return Promise.resolve([]);
  }

  getStats(urlId: string, from?: Date, to?: Date): Promise<ClickStats> {
    void urlId;
    void from;
    void to;
    return Promise.resolve({
      totalClicks: 0,
      clicksByDate: [],
      clicksByReferrer: [],
    });
  }
}
