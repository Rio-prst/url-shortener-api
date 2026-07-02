import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';
import { AnalyticsRepository } from './analytics.repository.js';
import { IAnalyticsService } from './interfaces/analytics.service.interface.js';
import { IAnalyticsRepository } from './interfaces/analytics.repository.interface.js';

@Module({
  providers: [
    {
      provide: IAnalyticsService,
      useClass: AnalyticsService,
    },
    {
      provide: IAnalyticsRepository,
      useClass: AnalyticsRepository,
    },
  ],
  exports: [IAnalyticsService],
})
export class AnalyticsModule {}
