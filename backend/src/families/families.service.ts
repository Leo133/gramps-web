import {Injectable, NotImplementedException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

@Injectable()
export class FamiliesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    throw new NotImplementedException('Families listing not yet implemented')
  }

  async findOne(_handle: string) {
    throw new NotImplementedException('Families retrieval not yet implemented')
  }

  async create(_data: any) {
    throw new NotImplementedException('Families creation not yet implemented')
  }

  async update(_handle: string, _data: any) {
    throw new NotImplementedException('Families update not yet implemented')
  }

  async remove(_handle: string) {
    throw new NotImplementedException('Families deletion not yet implemented')
  }
}
