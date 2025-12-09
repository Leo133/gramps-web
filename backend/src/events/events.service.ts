import {Injectable, NotImplementedException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    throw new NotImplementedException('Events listing not yet implemented')
  }

  async findOne(handle: string) {
    throw new NotImplementedException('Events retrieval not yet implemented')
  }

  async create(data: any) {
    throw new NotImplementedException('Events creation not yet implemented')
  }

  async update(handle: string, data: any) {
    throw new NotImplementedException('Events update not yet implemented')
  }

  async remove(handle: string) {
    throw new NotImplementedException('Events deletion not yet implemented')
  }
}
