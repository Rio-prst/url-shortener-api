import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import { ICacheService } from './interfaces/cache.service.interface';

@Global()
@Module({
  providers: [
    {
      provide: ICacheService,
      useClass: CacheService,
    },
  ],
  exports: [ICacheService],
})
export class CacheModule {}
