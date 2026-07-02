import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { AnalyticsService } from './analytics.service';
import { IAnalyticsRepository } from './interfaces/analytics.repository.interface';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  const mockRepository = mock<IAnalyticsRepository>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: IAnalyticsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get(AnalyticsService);
    jest.clearAllMocks();
  });

  describe('recordClick', () => {
    it('should delegate to repository', async () => {
      mockRepository.recordClick.mockResolvedValue({
        id: '1',
        urlId: '1',
        timestamp: new Date(),
        referrer: 'https://google.com',
      });

      const result = await service.recordClick('1', 'https://google.com');

      expect(result.urlId).toBe('1');
    });
  });

  describe('getStats', () => {
    it('should delegate to repository', async () => {
      mockRepository.getStats.mockResolvedValue({
        totalClicks: 10,
        clicksByDate: [],
        clicksByReferrer: [],
      });

      const result = await service.getStats('1');

      expect(result.totalClicks).toBe(10);
    });

    it('should pass date filters', async () => {
      mockRepository.getStats.mockResolvedValue({
        totalClicks: 0,
        clicksByDate: [],
        clicksByReferrer: [],
      });

      const from = new Date('2026-01-01');
      const to = new Date('2026-01-31');
      await service.getStats('1', from, to);

      expect(mockRepository.getStats).toHaveBeenCalledWith('1', from, to);
    });
  });
});
