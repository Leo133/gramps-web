import {Injectable} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return []
  }

  async findOne(handle: string) {
    return {}
  }

  async create(data: any) {
    return {}
  }

  async update(handle: string, data: any) {
    return {}
  }

  async remove(handle: string) {
    return {message: 'Deleted successfully'}
  }
}
