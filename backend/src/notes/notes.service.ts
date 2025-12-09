import {Injectable, NotImplementedException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    throw new NotImplementedException('Notes listing not yet implemented')
  }

  async findOne(handle: string) {
    throw new NotImplementedException('Notes retrieval not yet implemented')
  }

  async create(data: any) {
    throw new NotImplementedException('Notes creation not yet implemented')
  }

  async update(handle: string, data: any) {
    throw new NotImplementedException('Notes update not yet implemented')
  }

  async remove(handle: string) {
    throw new NotImplementedException('Notes deletion not yet implemented')
  }
}
