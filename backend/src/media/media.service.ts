import {Injectable, NotImplementedException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    throw new NotImplementedException('Media listing not yet implemented')
  }

  async findOne(handle: string) {
    throw new NotImplementedException('Media retrieval not yet implemented')
  }

  async create(data: any) {
    throw new NotImplementedException('Media creation not yet implemented')
  }

  async update(handle: string, data: any) {
    throw new NotImplementedException('Media update not yet implemented')
  }

  async remove(handle: string) {
    throw new NotImplementedException('Media deletion not yet implemented')
  }
}
