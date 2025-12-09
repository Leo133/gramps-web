import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class MetadataService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return [];
  }

  async findOne(handle: string) {
    return null;
  }
}
