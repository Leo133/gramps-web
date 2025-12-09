import {Injectable, NotImplementedException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

@Injectable()
export class SourcesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    throw new NotImplementedException('Sources listing not yet implemented')
  }

  async findOne(_handle: string) {
    throw new NotImplementedException('Source retrieval not yet implemented')
  }

  async create(_data: any) {
    throw new NotImplementedException('Source creation not yet implemented')
  }

  async update(_handle: string, _data: any) {
    throw new NotImplementedException('Source update not yet implemented')
  }

  async remove(_handle: string) {
    throw new NotImplementedException('Source deletion not yet implemented')
  }
}
