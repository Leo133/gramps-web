import {Injectable, NotImplementedException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

@Injectable()
export class RepositoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    throw new NotImplementedException(
      'Repositories listing not yet implemented',
    )
  }

  async findOne(_handle: string) {
    throw new NotImplementedException(
      'Repositories retrieval not yet implemented',
    )
  }

  async create(_data: any) {
    throw new NotImplementedException(
      'Repositories creation not yet implemented',
    )
  }

  async update(_handle: string, _data: any) {
    throw new NotImplementedException('Repositories update not yet implemented')
  }

  async remove(_handle: string) {
    throw new NotImplementedException(
      'Repositories deletion not yet implemented',
    )
  }
}
