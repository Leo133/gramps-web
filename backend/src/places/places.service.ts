import {Injectable, NotImplementedException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

@Injectable()
export class PlacesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    throw new NotImplementedException('Places listing not yet implemented')
  }

  async findOne(handle: string) {
    throw new NotImplementedException('Places retrieval not yet implemented')
  }

  async create(data: any) {
    throw new NotImplementedException('Places creation not yet implemented')
  }

  async update(handle: string, data: any) {
    throw new NotImplementedException('Places update not yet implemented')
  }

  async remove(handle: string) {
    throw new NotImplementedException('Places deletion not yet implemented')
  }
}
