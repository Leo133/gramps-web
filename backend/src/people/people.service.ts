import {Injectable, NotFoundException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'
import {CreatePersonDto, UpdatePersonDto} from './dto/person.dto'
import {v4 as uuidv4} from 'uuid'

interface FormattedPerson {
  handle: string
  gramps_id: string
  gender: number
  private: boolean
  first_name?: string | null
  surname?: string | null
  call_name?: string | null
  birth_date?: string | null
  birth_place?: string | null
  death_date?: string | null
  death_place?: string | null
  primary_name?: any
  profile?: any
  media_list?: any[]
  event_ref_list?: any[]
}

@Injectable()
export class PeopleService {
  constructor(private prisma: PrismaService) {}

  async create(createPersonDto: CreatePersonDto) {
    const handle = createPersonDto.handle || uuidv4().replace(/-/g, '')
    const grampsId =
      createPersonDto.grampsId || `I${String(await this.getNextId()).padStart(4, '0')}`

    const person = await this.prisma.person.create({
      data: {
        handle,
        grampsId,
        ...createPersonDto,
      },
    })

    return this.formatPerson(person)
  }

  async findAll(query?: {
    q?: string
    page?: number
    pagesize?: number
    gramps_id?: string
  }) {
    const {q, page = 1, pagesize = 25, gramps_id} = query || {}

    let where: any = {}

    if (gramps_id) {
      where.grampsId = gramps_id
    } else if (q) {
      where.OR = [
        {firstName: {contains: q, mode: 'insensitive'}},
        {surname: {contains: q, mode: 'insensitive'}},
        {grampsId: {contains: q, mode: 'insensitive'}},
        {handle: {contains: q, mode: 'insensitive'}},
      ]
    }

    const skip = (Number(page) - 1) * Number(pagesize)
    const take = Number(pagesize)

    const [people, total] = await Promise.all([
      this.prisma.person.findMany({
        where,
        skip,
        take,
      }),
      this.prisma.person.count({where}),
    ])

    return {
      data: people.map((p) => this.formatPerson(p)),
      total,
      page: Number(page),
      pagesize: Number(pagesize),
    }
  }

  async findOne(handle: string) {
    const person = await this.prisma.person.findUnique({
      where: {handle},
    })

    if (!person) {
      throw new NotFoundException(`Person with handle ${handle} not found`)
    }

    return this.formatPerson(person)
  }

  async update(handle: string, updatePersonDto: UpdatePersonDto) {
    await this.findOne(handle) // Check if exists

    const person = await this.prisma.person.update({
      where: {handle},
      data: updatePersonDto,
    })

    return this.formatPerson(person)
  }

  async remove(handle: string) {
    await this.findOne(handle) // Check if exists

    await this.prisma.person.delete({
      where: {handle},
    })

    return {message: 'Person deleted successfully'}
  }

  private async getNextId(): Promise<number> {
    const count = await this.prisma.person.count()
    return count + 1
  }

  private formatPerson(person: any): FormattedPerson {
    // Convert JSON strings back to objects if needed
    const formatted: FormattedPerson = {
      handle: person.handle,
      gramps_id: person.grampsId,
      gender: person.gender,
      private: person.private,
      first_name: person.firstName,
      surname: person.surname,
      call_name: person.callName,
      birth_date: person.birthDate,
      birth_place: person.birthPlace,
      death_date: person.deathDate,
      death_place: person.deathPlace,
    }

    if (person.primaryName && typeof person.primaryName === 'string') {
      try {
        formatted.primary_name = JSON.parse(person.primaryName)
      } catch {
        formatted.primary_name = person.primaryName
      }
    }

    if (person.profile && typeof person.profile === 'string') {
      try {
        formatted.profile = JSON.parse(person.profile)
      } catch {
        formatted.profile = person.profile
      }
    }

    if (person.mediaList && typeof person.mediaList === 'string') {
      try {
        formatted.media_list = JSON.parse(person.mediaList)
      } catch {
        formatted.media_list = []
      }
    }

    if (person.eventRefList && typeof person.eventRefList === 'string') {
      try {
        formatted.event_ref_list = JSON.parse(person.eventRefList)
      } catch {
        formatted.event_ref_list = []
      }
    }

    return formatted
  }
}
