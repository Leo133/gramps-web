import {Injectable} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

interface MigrationFlow {
  personHandle: string
  personName: string
  events: Array<{
    type: string
    date: string
    placeName: string
    latitude: number
    longitude: number
    sequence: number
  }>
  path: Array<[number, number]>
}

@Injectable()
export class GeospatialService {
  constructor(private prisma: PrismaService) {}

  async getMigrationFlows(personHandle?: string): Promise<MigrationFlow[]> {
    // Get all people with events (or a specific person)
    const whereClause = personHandle ? {handle: personHandle} : {}
    const people = await this.prisma.person.findMany({
      where: whereClause,
      include: {
        events: {
          orderBy: {
            date: 'asc',
          },
        },
      },
    })

    const flows: MigrationFlow[] = []

    for (const person of people) {
      // Get all events with places that have coordinates
      const eventsWithPlaces = await Promise.all(
        person.events.map(async event => {
          if (!event.place) return null

          // Try to find the place by name or handle
          const place = await this.prisma.place.findFirst({
            where: {
              OR: [{name: event.place}, {handle: event.place}],
            },
          })

          if (
            !place ||
            !place.latitude ||
            !place.longitude ||
            (place.latitude === 0 && place.longitude === 0)
          ) {
            return null
          }

          return {
            type: event.type,
            date: event.date || '',
            placeName: place.name,
            latitude: place.latitude,
            longitude: place.longitude,
          }
        })
      )

      const validEvents = eventsWithPlaces.filter(e => e !== null)

      if (validEvents.length < 2) {
        continue // Need at least 2 events to create a flow
      }

      // Sort events by date (events without dates go to the end)
      const sortedEvents = validEvents.sort((a, b) => {
        if (!a.date) return 1
        if (!b.date) return -1
        return a.date.localeCompare(b.date)
      })

      // Add sequence numbers
      const eventsWithSequence = sortedEvents.map((event, index) => ({
        ...event,
        sequence: index,
      }))

      // Extract path as array of [lat, lng] coordinates
      const path: Array<[number, number]> = eventsWithSequence.map(event => [
        event.latitude,
        event.longitude,
      ])

      flows.push({
        personHandle: person.handle,
        personName: `${person.firstName || ''} ${person.surname || ''}`.trim(),
        events: eventsWithSequence,
        path,
      })
    }

    return flows
  }

  async getPlaceClusters(options?: {
    zoom?: number
    bounds?: {
      north: number
      south: number
      east: number
      west: number
    }
  }) {
    const {zoom = 1, bounds} = options || {}

    // Get all places with coordinates
    let whereClause: any = {
      AND: [
        {latitude: {not: null}},
        {longitude: {not: null}},
        {
          NOT: {
            AND: [{latitude: 0}, {longitude: 0}],
          },
        },
      ],
    }

    // Add bounds filtering if provided
    if (bounds) {
      whereClause.AND.push({
        latitude: {gte: bounds.south, lte: bounds.north},
      })
      whereClause.AND.push({
        longitude: {gte: bounds.west, lte: bounds.east},
      })
    }

    const places = await this.prisma.place.findMany({
      where: whereClause,
    })

    // For zoom levels, we'll implement simple grid-based clustering
    // In production, use a proper clustering algorithm like DBSCAN or k-means
    const clusterSize = this.getClusterSizeForZoom(zoom)

    const clusters = new Map<string, any>()

    for (const place of places) {
      // TypeScript guard - these should never be null due to where clause
      if (!place.latitude || !place.longitude) continue

      // Round coordinates to create grid cells
      const latKey = Math.floor(place.latitude / clusterSize) * clusterSize
      const lngKey = Math.floor(place.longitude / clusterSize) * clusterSize
      const clusterKey = `${latKey},${lngKey}`

      if (!clusters.has(clusterKey)) {
        clusters.set(clusterKey, {
          latitude: latKey + clusterSize / 2,
          longitude: lngKey + clusterSize / 2,
          count: 0,
          places: [],
        })
      }

      const cluster = clusters.get(clusterKey)
      if (cluster) {
        cluster.count++
        cluster.places.push({
          handle: place.handle,
          name: place.name,
          latitude: place.latitude,
          longitude: place.longitude,
        })
      }
    }

    return Array.from(clusters.values())
  }

  private getClusterSizeForZoom(zoom: number): number {
    // Higher zoom = smaller cluster size = more clusters
    // Zoom levels typically range from 0 (world) to 20 (building)
    if (zoom >= 15) return 0.001 // ~100m
    if (zoom >= 12) return 0.01 // ~1km
    if (zoom >= 9) return 0.1 // ~10km
    if (zoom >= 6) return 1 // ~100km
    if (zoom >= 3) return 10 // ~1000km
    return 50 // ~5000km
  }
}
