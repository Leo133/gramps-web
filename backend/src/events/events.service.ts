import {Injectable, NotImplementedException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    throw new NotImplementedException('Events listing not yet implemented')
  }

  async findOne(_handle: string) {
    throw new NotImplementedException('Events retrieval not yet implemented')
  }

  async create(_data: any) {
    throw new NotImplementedException('Events creation not yet implemented')
  }

  async update(_handle: string, _data: any) {
    throw new NotImplementedException('Events update not yet implemented')
  }

  async remove(_handle: string) {
    throw new NotImplementedException('Events deletion not yet implemented')
  }
}
