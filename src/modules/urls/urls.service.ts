import { Injectable } from '@nestjs/common';
import { IUrlsService, UrlResponse } from './interfaces/urls.service.interface';
import { CreateUrlDto } from './dto/create-url.dto';

// TODO: implement with slug generation + repository calls
@Injectable()
export class UrlsService implements IUrlsService {
  createUrl(dto: CreateUrlDto, userId?: string): Promise<UrlResponse> {
    void dto;
    void userId;
    return Promise.resolve({
      id: '',
      slug: '',
      originalUrl: '',
      userId: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    });
  }

  findBySlug(slug: string): Promise<UrlResponse | null> {
    void slug;
    return Promise.resolve(null);
  }

  findById(id: string): Promise<UrlResponse | null> {
    void id;
    return Promise.resolve(null);
  }

  deleteUrl(id: string, userId: string): Promise<void> {
    void id;
    void userId;
    return Promise.resolve();
  }

  generateSlug(): string {
    return '';
  }
}
