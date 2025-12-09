import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class CitationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return [];
  }

  async findOne(handle: string) {
    return null;
  }
}
