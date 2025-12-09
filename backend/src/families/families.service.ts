import {Injectable, NotImplementedException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

@Injectable()
export class FamiliesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    throw new NotImplementedException('Families listing not yet implemented')
  }

  async findOne(handle: string) {
    throw new NotImplementedException('Families retrieval not yet implemented')
  }

  async create(data: any) {
    throw new NotImplementedException('Families creation not yet implemented')
  }

  async update(handle: string, data: any) {
    throw new NotImplementedException('Families update not yet implemented')
  }

  async remove(handle: string) {
    throw new NotImplementedException('Families deletion not yet implemented')
  }
}
