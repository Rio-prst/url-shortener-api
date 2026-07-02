export interface RecordClickInput {
  urlId: string;
  referrer?: string;
  userAgent?: string;
}

export interface ClickEvent {
  id: string;
  urlId: string;
  timestamp: Date;
  referrer: string | null;
}

export interface ClickStats {
  totalClicks: number;
  clicksByDate: Array<{ date: string; count: number }>;
  clicksByReferrer: Array<{ referrer: string; count: number }>;
}

export const IAnalyticsRepository = Symbol('IAnalyticsRepository');

export interface IAnalyticsRepository {
  recordClick(data: RecordClickInput): Promise<ClickEvent>;
  getTotalClicks(urlId: string): Promise<number>;
  getClicksByDate(
    urlId: string,
    from?: Date,
    to?: Date,
  ): Promise<Array<{ date: string; count: number }>>;
  getClicksByReferrer(
    urlId: string,
  ): Promise<Array<{ referrer: string; count: number }>>;
  getStats(urlId: string, from?: Date, to?: Date): Promise<ClickStats>;
}
