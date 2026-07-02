import { CreateUrlDto } from '../dto/create-url.dto';

export interface UrlResponse {
  id: string;
  slug: string;
  originalUrl: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const IUrlsService = Symbol('IUrlsService');

export interface IUrlsService {
  createUrl(dto: CreateUrlDto, userId?: string): Promise<UrlResponse>;
  findBySlug(slug: string): Promise<UrlResponse | null>;
  findById(id: string): Promise<UrlResponse | null>;
  deleteUrl(id: string, userId: string): Promise<void>;
  generateSlug(): string;
}
