import {Injectable, NotFoundException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'
import {CreatePlaceDto, UpdatePlaceDto} from './dto/place.dto'
import {v4 as uuidv4} from 'uuid'

interface FormattedPlace {
  handle: string
  gramps_id: string
  name: string
  title?: string | null
  latitude?: number | null
  longitude?: number | null
  place_type?: any
  hierarchy?: any
  profile?: any
}

@Injectable()
export class PlacesService {
  constructor(private prisma: PrismaService) {}

  async create(createPlaceDto: CreatePlaceDto) {
    const handle = createPlaceDto.handle || uuidv4().replace(/-/g, '')
    const grampsId =
      createPlaceDto.grampsId ||
      `P${String(await this.getNextId()).padStart(4, '0')}`

    const place = await this.prisma.place.create({
      data: {
        handle,
        grampsId,
        name: createPlaceDto.name,
        title: createPlaceDto.title,
        latitude: createPlaceDto.latitude,
        longitude: createPlaceDto.longitude,
        placeType: createPlaceDto.placeType,
        hierarchy: createPlaceDto.hierarchy,
      },
    })

    return this.formatPlace(place)
  }

  async findAll(query?: {
    q?: string
    page?: number
    pagesize?: number
    gramps_id?: string
    locale?: string
    profile?: string
    backlinks?: string
  }) {
    const {q, page = 1, pagesize = 25, gramps_id} = query || {}

    const where: any = {}

    if (gramps_id) {
      where.grampsId = gramps_id
    } else if (q) {
      where.OR = [
        {name: {contains: q, mode: 'insensitive'}},
        {title: {contains: q, mode: 'insensitive'}},
        {grampsId: {contains: q, mode: 'insensitive'}},
        {handle: {contains: q, mode: 'insensitive'}},
      ]
    }

    const skip = (Number(page) - 1) * Number(pagesize)
    const take = Number(pagesize)

    const [places, total] = await Promise.all([
      this.prisma.place.findMany({
        where,
        skip,
        take,
        orderBy: {name: 'asc'},
      }),
      this.prisma.place.count({where}),
    ])

    return {
      data: places.map(p => this.formatPlace(p)),
      total,
      page: Number(page),
      pagesize: Number(pagesize),
    }
  }

  async findOne(handle: string) {
    const place = await this.prisma.place.findUnique({
      where: {handle},
    })

    if (!place) {
      throw new NotFoundException(`Place with handle ${handle} not found`)
    }

    return this.formatPlace(place)
  }

  async update(handle: string, updatePlaceDto: UpdatePlaceDto) {
    await this.findOne(handle) // Check if exists

    const place = await this.prisma.place.update({
      where: {handle},
      data: updatePlaceDto,
    })

    return this.formatPlace(place)
  }

  async remove(handle: string) {
    await this.findOne(handle) // Check if exists

    await this.prisma.place.delete({
      where: {handle},
    })

    return {message: 'Place deleted successfully'}
  }

  async getEventClusters(zoom?: number) {
    // Get all places with coordinates
    const places = await this.prisma.place.findMany({
      where: {
        AND: [
          {latitude: {not: null}},
          {longitude: {not: null}},
          {
            NOT: {
              AND: [{latitude: 0}, {longitude: 0}],
            },
          },
        ],
      },
    })

    // Group places by proximity based on zoom level
    // For now, return all places with their coordinates
    // In a production implementation, this would use a proper clustering algorithm
    return places.map(place => ({
      handle: place.handle,
      name: place.name,
      latitude: place.latitude,
      longitude: place.longitude,
      count: 1, // This would be aggregated in a real clustering implementation
    }))
  }

  async geocode(query: string) {
    // Mock geocoding service
    // In production, this would integrate with Nominatim, Google Maps API, or similar
    return {
      query,
      results: [
        {
          name: query,
          display_name: query,
          latitude: 0,
          longitude: 0,
          type: 'place',
          importance: 0.5,
        },
      ],
      message:
        'Mock geocoding service. Integrate with Nominatim or Google Maps API for production use.',
    }
  }

  async reverseGeocode(latitude: number, longitude: number) {
    // Mock reverse geocoding service
    // In production, this would integrate with Nominatim, Google Maps API, or similar
    return {
      latitude,
      longitude,
      name: `Location at ${latitude}, ${longitude}`,
      hierarchy: [],
      message:
        'Mock reverse geocoding service. Integrate with Nominatim or Google Maps API for production use.',
    }
  }

  private async getNextId(): Promise<number> {
    const count = await this.prisma.place.count()
    return count + 1
  }

  private formatPlace(place: any): FormattedPlace {
    const formatted: FormattedPlace = {
      handle: place.handle,
      gramps_id: place.grampsId,
      name: place.name,
      title: place.title,
      latitude: place.latitude,
      longitude: place.longitude,
    }

    if (place.placeType && typeof place.placeType === 'string') {
      try {
        formatted.place_type = JSON.parse(place.placeType)
      } catch {
        formatted.place_type = place.placeType
      }
    }

    if (place.hierarchy && typeof place.hierarchy === 'string') {
      try {
        formatted.hierarchy = JSON.parse(place.hierarchy)
      } catch {
        formatted.hierarchy = []
      }
    }

    // Create profile object for compatibility with frontend
    formatted.profile = {
      name: place.name,
      gramps_id: place.grampsId,
      lat: place.latitude,
      long: place.longitude,
    }

    return formatted
  }
}
