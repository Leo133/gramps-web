import {Injectable, NotImplementedException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    throw new NotImplementedException('Media listing not yet implemented')
  }

  async findOne(_handle: string) {
    throw new NotImplementedException('Media retrieval not yet implemented')
  }

  async create(_data: any) {
    throw new NotImplementedException('Media creation not yet implemented')
  }

  async update(_handle: string, _data: any) {
    throw new NotImplementedException('Media update not yet implemented')
  }

  async remove(_handle: string) {
    throw new NotImplementedException('Media deletion not yet implemented')
  }
}
