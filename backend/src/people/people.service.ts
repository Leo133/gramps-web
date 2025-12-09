import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PeopleService {
  constructor(private prisma: PrismaService) {}

  async create(createPersonDto: CreatePersonDto) {
    return this.prisma.person.create({
      data: createPersonDto,
    });
  }

  async findAll(query: { page?: number; pagesize?: number; q?: string; gramps_id?: string }) {
    const page = parseInt(String(query.page || '1'), 10);
    const pagesize = parseInt(String(query.pagesize || '25'), 10);
    const skip = (page - 1) * pagesize;

    const where: { grampsId?: string; OR?: Array<{ firstName?: { contains: string; mode: 'insensitive' }; surname?: { contains: string; mode: 'insensitive' }; grampsId?: { contains: string; mode: 'insensitive' } }> } = {};

    if (query.gramps_id) {
      where.grampsId = query.gramps_id;
    } else if (query.q) {
      where.OR = [
        { firstName: { contains: query.q, mode: 'insensitive' } },
        { surname: { contains: query.q, mode: 'insensitive' } },
        { grampsId: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [people, total] = await Promise.all([
      this.prisma.person.findMany({
        where,
        skip,
        take: pagesize,
        orderBy: { grampsId: 'asc' },
      }),
      this.prisma.person.count({ where }),
    ]);

    return { people, total };
  }

  async findOne(handle: string) {
    const person = await this.prisma.person.findUnique({
      where: { handle },
    });

    if (!person) {
      throw new NotFoundException(`Person with handle ${handle} not found`);
    }

    return person;
  }

  async update(handle: string, updatePersonDto: UpdatePersonDto) {
    return this.prisma.person.update({
      where: { handle },
      data: updatePersonDto,
    });
  }

  async remove(handle: string) {
    await this.prisma.person.delete({
      where: { handle },
    });
  }
}
