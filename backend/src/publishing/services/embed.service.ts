import {Injectable, BadRequestException} from '@nestjs/common'
import {PrismaService} from '../../prisma/prisma.service'
import {CreateEmbedDto} from '../dto/publishing.dto'
import * as crypto from 'crypto'

@Injectable()
export class EmbedService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate embed code for a widget
   */
  async generateEmbedCode(userId: string, dto: CreateEmbedDto) {
    // Validate widget type
    const validTypes = ['tree', 'pedigree', 'fan', 'timeline', 'photos', 'map']
    if (!validTypes.includes(dto.type)) {
      throw new BadRequestException(`Invalid widget type: ${dto.type}`)
    }

    // Generate embed token
    const embedToken = this.generateEmbedToken(userId, dto.type, dto.entityId)

    // Build embed URL
    const baseUrl = 'https://gramps.io/embed'
    const embedUrl = `${baseUrl}/${dto.type}/${embedToken}`

    // Default options
    const options = {
      generations: dto.options?.generations || 3,
      direction: dto.options?.direction || 'both',
      width: dto.options?.width || '100%',
      height: dto.options?.height || '600px',
      theme: dto.options?.theme || 'light',
    }

    // Generate iframe code
    const iframeCode = `<iframe 
  src="${embedUrl}" 
  width="${options.width}" 
  height="${options.height}" 
  frameborder="0" 
  style="border: 1px solid #e0e0e0; border-radius: 8px;"
  allow="fullscreen"
  loading="lazy"
  title="Family Tree Widget">
</iframe>`

    // Generate JavaScript widget code (for more customization)
    const scriptCode = `<!-- Gramps Web Widget -->
<div id="gramps-${dto.type}-widget" 
     data-entity="${dto.entityId}" 
     data-type="${dto.type}"
     data-generations="${options.generations}"
     data-direction="${options.direction}"
     data-theme="${options.theme}">
</div>
<script src="https://gramps.io/widget.js" async></script>`

    return {
      embedToken,
      type: dto.type,
      entityId: dto.entityId,
      options,
      embedUrl,
      iframeCode: iframeCode.replace(/\s+/g, ' ').trim(),
      scriptCode,
      previewUrl: `/preview/embed/${dto.type}/${dto.entityId}`,
    }
  }

  /**
   * Get available widget types
   */
  getWidgetTypes() {
    return [
      {
        id: 'tree',
        name: 'Family Tree',
        description: 'Interactive family tree with ancestors and descendants',
        defaultHeight: '600px',
        options: ['generations', 'direction', 'theme'],
      },
      {
        id: 'pedigree',
        name: 'Pedigree Chart',
        description: 'Traditional pedigree chart showing ancestors',
        defaultHeight: '400px',
        options: ['generations', 'theme'],
      },
      {
        id: 'fan',
        name: 'Fan Chart',
        description: 'Circular fan chart of ancestors',
        defaultHeight: '600px',
        options: ['generations', 'theme'],
      },
      {
        id: 'timeline',
        name: 'Timeline',
        description: "Person or family timeline with life events",
        defaultHeight: '400px',
        options: ['theme'],
      },
      {
        id: 'photos',
        name: 'Photo Gallery',
        description: 'Carousel of family photos',
        defaultHeight: '400px',
        options: ['theme'],
      },
      {
        id: 'map',
        name: 'Event Map',
        description: 'Map showing locations of life events',
        defaultHeight: '400px',
        options: ['theme'],
      },
    ]
  }

  /**
   * Render embed widget (returns HTML/JSON for the widget)
   */
  async renderWidget(embedToken: string) {
    // Decode token to get widget info
    const decoded = this.decodeEmbedToken(embedToken)
    if (!decoded) {
      throw new BadRequestException('Invalid embed token')
    }

    const {type, entityId} = decoded

    // Get entity data based on type
    const data = await this.getWidgetData(type, entityId)

    return {
      type,
      entityId,
      data,
      renderAt: new Date().toISOString(),
    }
  }

  /**
   * Get widget data based on type
   */
  private async getWidgetData(type: string, entityId: string) {
    switch (type) {
      case 'tree':
      case 'pedigree':
      case 'fan':
        return this.getTreeData(entityId)
      case 'timeline':
        return this.getTimelineData(entityId)
      case 'photos':
        return this.getPhotosData(entityId)
      case 'map':
        return this.getMapData(entityId)
      default:
        throw new BadRequestException(`Unknown widget type: ${type}`)
    }
  }

  /**
   * Get tree data for widgets
   */
  private async getTreeData(personHandle: string) {
    const person = await this.prisma.person.findUnique({
      where: {handle: personHandle},
    })

    if (!person) {
      return {error: 'Person not found'}
    }

    // Get basic tree structure
    const families = await this.prisma.family.findMany()

    return {
      rootPerson: {
        handle: person.handle,
        grampsId: person.grampsId,
        firstName: person.firstName,
        surname: person.surname,
        gender: person.gender,
        birthDate: person.birthDate,
        deathDate: person.deathDate,
      },
      familyCount: families.length,
    }
  }

  /**
   * Get timeline data for widgets
   */
  private async getTimelineData(personHandle: string) {
    const person = await this.prisma.person.findUnique({
      where: {handle: personHandle},
    })

    if (!person) {
      return {error: 'Person not found'}
    }

    const events = await this.prisma.event.findMany({
      where: {personHandle},
      orderBy: {date: 'asc'},
    })

    return {
      person: {
        handle: person.handle,
        firstName: person.firstName,
        surname: person.surname,
      },
      events: events.map(e => ({
        type: e.type,
        date: e.date,
        place: e.place,
        description: e.description,
      })),
    }
  }

  /**
   * Get photos data for widgets
   */
  private async getPhotosData(personHandle: string) {
    const person = await this.prisma.person.findUnique({
      where: {handle: personHandle},
    })

    if (!person) {
      return {error: 'Person not found'}
    }

    // Parse media list from person profile
    const mediaList = person.mediaList ? JSON.parse(person.mediaList) : []

    // Get media items
    const media = await this.prisma.media.findMany({
      where: {
        handle: {in: mediaList},
      },
    })

    return {
      person: {
        handle: person.handle,
        firstName: person.firstName,
        surname: person.surname,
      },
      photos: media.map(m => ({
        handle: m.handle,
        path: m.path,
        mimeType: m.mimeType,
        desc: m.desc,
      })),
    }
  }

  /**
   * Get map data for widgets
   */
  private async getMapData(personHandle: string) {
    const events = await this.prisma.event.findMany({
      where: {personHandle},
    })

    // Get places for events
    const placeNames = events.filter(e => e.place).map(e => e.place!)
    const places = await this.prisma.place.findMany({
      where: {
        OR: [
          {name: {in: placeNames}},
          {title: {in: placeNames}},
        ],
      },
    })

    return {
      events: events.map(e => {
        const place = places.find(p => p.name === e.place || p.title === e.place)
        return {
          type: e.type,
          date: e.date,
          place: e.place,
          latitude: place?.latitude,
          longitude: place?.longitude,
        }
      }),
    }
  }

  /**
   * Generate embed token
   */
  private generateEmbedToken(userId: string, type: string, entityId: string): string {
    const payload = `${userId}:${type}:${entityId}:${Date.now()}`
    const token = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'embed-secret')
      .update(payload)
      .digest('base64url')
    return `${Buffer.from(`${type}:${entityId}`).toString('base64url')}.${token.slice(0, 16)}`
  }

  /**
   * Decode embed token
   */
  private decodeEmbedToken(embedToken: string): {type: string; entityId: string} | null {
    try {
      const [encoded] = embedToken.split('.')
      const decoded = Buffer.from(encoded, 'base64url').toString('utf8')
      const [type, entityId] = decoded.split(':')
      return {type, entityId}
    } catch {
      return null
    }
  }
}
