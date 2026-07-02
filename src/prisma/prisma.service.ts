import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

// TODO: implement with Prisma
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {}
  async onModuleDestroy(): Promise<void> {}
}
