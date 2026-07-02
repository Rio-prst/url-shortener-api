export interface CreateUrlInput {
  slug: string;
  originalUrl: string;
  userId?: string;
}

export interface Url {
  id: string;
  slug: string;
  originalUrl: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const IUrlsRepository = Symbol('IUrlsRepository');

export interface IUrlsRepository {
  createUrl(data: CreateUrlInput): Promise<Url>;
  findBySlug(slug: string): Promise<Url | null>;
  findById(id: string): Promise<Url | null>;
  deleteUrl(id: string): Promise<void>;
  slugExists(slug: string): Promise<boolean>;
}
