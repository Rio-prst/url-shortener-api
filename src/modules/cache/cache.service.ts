import { Injectable } from '@nestjs/common';
import { ICacheService } from './interfaces/cache.service.interface';

// TODO: implement with Redis
@Injectable()
export class CacheService implements ICacheService {
  get<T>(key: string): Promise<T | null> {
    void key;
    return Promise.resolve(null);
  }

  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    void key;
    void value;
    void ttlSeconds;
    return Promise.resolve();
  }

  del(key: string): Promise<void> {
    void key;
    return Promise.resolve();
  }

  isConnected(): boolean {
    return false;
  }
}
