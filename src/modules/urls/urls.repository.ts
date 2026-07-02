import { Injectable } from '@nestjs/common';
import {
  IUrlsRepository,
  CreateUrlInput,
  Url,
} from './interfaces/urls.repository.interface';

// TODO: implement with Prisma TypedSQL
@Injectable()
export class UrlsRepository implements IUrlsRepository {
  createUrl(data: CreateUrlInput): Promise<Url> {
    void data;
    return Promise.resolve({
      id: '',
      slug: '',
      originalUrl: '',
      userId: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    });
  }

  findBySlug(slug: string): Promise<Url | null> {
    void slug;
    return Promise.resolve(null);
  }

  findById(id: string): Promise<Url | null> {
    void id;
    return Promise.resolve(null);
  }

  deleteUrl(id: string): Promise<void> {
    void id;
    return Promise.resolve();
  }

  slugExists(slug: string): Promise<boolean> {
    void slug;
    return Promise.resolve(false);
  }
}
