import {Injectable, NotImplementedException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

@Injectable()
export class SourcesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    throw new NotImplementedException('Sources listing not yet implemented')
  }

  async findOne(handle: string) {
    throw new NotImplementedException('Source retrieval not yet implemented')
  }

  async create(data: any) {
    throw new NotImplementedException('Source creation not yet implemented')
  }

  async update(handle: string, data: any) {
    throw new NotImplementedException('Source update not yet implemented')
  }

  async remove(handle: string) {
    throw new NotImplementedException('Source deletion not yet implemented')
  }
}
