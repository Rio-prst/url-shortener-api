import { Module, Global } from '@nestjs/common';
import { Redis } from 'ioredis';
import { CacheService } from './cache.service';
import { ICacheService } from './interfaces/cache.service.interface';

@Global()
@Module({
  providers: [
    {
      provide: Redis,
      useFactory: () => new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379'),
    },
    {
      provide: ICacheService,
      useClass: CacheService,
    },
  ],
  exports: [ICacheService],
})
export class CacheModule {}
