import {Injectable, NotFoundException, BadRequestException} from '@nestjs/common'
import {PrismaService} from '../../prisma/prisma.service'
import {CalendarExportDto} from '../dto/publishing.dto'

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate Open Graph / Twitter Card metadata for an entity
   */
  async generateSocialCard(entityType: string, entityId: string) {
    switch (entityType.toLowerCase()) {
      case 'person':
        return this.generatePersonCard(entityId)
      case 'family':
        return this.generateFamilyCard(entityId)
      case 'media':
        return this.generateMediaCard(entityId)
      default:
        throw new BadRequestException(`Unknown entity type: ${entityType}`)
    }
  }

  /**
   * Generate social card for a person
   */
  private async generatePersonCard(personHandle: string) {
    const person = await this.prisma.person.findUnique({
      where: {handle: personHandle},
    })

    if (!person) {
      throw new NotFoundException('Person not found')
    }

    const name = `${person.firstName || ''} ${person.surname || ''}`.trim() || 'Unknown'
    const lifespan = this.formatLifespan(person.birthDate, person.deathDate)

    return {
      // Open Graph
      og: {
        title: lifespan ? `${name} (${lifespan})` : name,
        description: `Explore the family tree and history of ${name}`,
        type: 'profile',
        url: `https://gramps.io/person/${personHandle}`,
        image: `https://gramps.io/api/social-card/person/${personHandle}.png`,
      },
      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: lifespan ? `${name} (${lifespan})` : name,
        description: `Explore the family tree and history of ${name}`,
        image: `https://gramps.io/api/social-card/person/${personHandle}.png`,
      },
      // Structured data (JSON-LD)
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name,
        birthDate: person.birthDate,
        deathDate: person.deathDate,
        birthPlace: person.birthPlace,
        deathPlace: person.deathPlace,
      },
    }
  }

  /**
   * Generate social card for a family
   */
  private async generateFamilyCard(familyHandle: string) {
    const family = await this.prisma.family.findUnique({
      where: {handle: familyHandle},
    })

    if (!family) {
      throw new NotFoundException('Family not found')
    }

    // Get parents
    const father = family.fatherHandle
      ? await this.prisma.person.findUnique({where: {handle: family.fatherHandle}})
      : null
    const mother = family.motherHandle
      ? await this.prisma.person.findUnique({where: {handle: family.motherHandle}})
      : null

    const fatherName = father
      ? `${father.firstName || ''} ${father.surname || ''}`.trim()
      : 'Unknown'
    const motherName = mother
      ? `${mother.firstName || ''} ${mother.surname || ''}`.trim()
      : 'Unknown'

    const title = `${fatherName} & ${motherName} Family`

    // Count children
    const childHandles = family.childRefList ? JSON.parse(family.childRefList) : []
    const childCount = childHandles.length

    return {
      og: {
        title,
        description: `View the family of ${fatherName} and ${motherName} with ${childCount} ${childCount === 1 ? 'child' : 'children'}`,
        type: 'website',
        url: `https://gramps.io/family/${familyHandle}`,
        image: `https://gramps.io/api/social-card/family/${familyHandle}.png`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: `View the family of ${fatherName} and ${motherName}`,
        image: `https://gramps.io/api/social-card/family/${familyHandle}.png`,
      },
    }
  }

  /**
   * Generate social card for media
   */
  private async generateMediaCard(mediaHandle: string) {
    const media = await this.prisma.media.findUnique({
      where: {handle: mediaHandle},
    })

    if (!media) {
      throw new NotFoundException('Media not found')
    }

    const isImage = media.mimeType?.startsWith('image/')

    return {
      og: {
        title: media.desc || 'Family Photo',
        description: media.desc || 'A photo from the family archive',
        type: isImage ? 'image' : 'article',
        url: `https://gramps.io/media/${mediaHandle}`,
        image: isImage
          ? `https://gramps.io/api/media/thumbnail/${mediaHandle}`
          : `https://gramps.io/images/default-media.png`,
      },
      twitter: {
        card: 'summary_large_image',
        title: media.desc || 'Family Photo',
        description: media.desc || 'A photo from the family archive',
        image: isImage
          ? `https://gramps.io/api/media/thumbnail/${mediaHandle}`
          : `https://gramps.io/images/default-media.png`,
      },
    }
  }

  /**
   * Generate calendar export (iCal format)
   */
  async exportCalendar(userId: string, dto: CalendarExportDto) {
    const format = dto.format || 'ical'
    const scope = (dto.scope || 'birthdays,anniversaries').split(',').map(s => s.trim())

    // Get all people for birthdays
    const people = await this.prisma.person.findMany({
      where: {
        birthDate: {not: null},
      },
    })

    // Get families for anniversaries
    const families = await this.prisma.family.findMany()

    const events: any[] = []

    // Add birthdays
    if (scope.includes('birthdays')) {
      for (const person of people) {
        if (person.birthDate) {
          const name = `${person.firstName || ''} ${person.surname || ''}`.trim()
          const dateInfo = this.parseDate(person.birthDate)

          if (dateInfo && dateInfo.month && dateInfo.day) {
            events.push({
              type: 'birthday',
              title: `${name}'s Birthday`,
              date: person.birthDate,
              month: dateInfo.month,
              day: dateInfo.day,
              recurring: true,
              personHandle: person.handle,
            })
          }
        }
      }
    }

    // Add death anniversaries if in scope
    if (scope.includes('deaths')) {
      for (const person of people) {
        if (person.deathDate) {
          const name = `${person.firstName || ''} ${person.surname || ''}`.trim()
          const dateInfo = this.parseDate(person.deathDate)

          if (dateInfo && dateInfo.month && dateInfo.day) {
            events.push({
              type: 'anniversary',
              title: `Anniversary of ${name}'s passing`,
              date: person.deathDate,
              month: dateInfo.month,
              day: dateInfo.day,
              recurring: true,
              personHandle: person.handle,
            })
          }
        }
      }
    }

    // Add marriage anniversaries
    if (scope.includes('anniversaries')) {
      // In a real implementation, we'd get marriage dates from events
      // For now, this is a placeholder
    }

    // Format output
    if (format === 'ical') {
      return this.formatIcal(events)
    } else if (format === 'csv') {
      return this.formatCsv(events)
    } else {
      throw new BadRequestException(`Unknown format: ${format}`)
    }
  }

  /**
   * Format events as iCal
   */
  private formatIcal(events: any[]) {
    const currentYear = new Date().getFullYear()

    let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Gramps Web//Family Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Family Events
`

    for (const event of events) {
      // Create event for current year
      const startDate = `${currentYear}${String(event.month).padStart(2, '0')}${String(event.day).padStart(2, '0')}`
      const uid = `${event.personHandle}-${event.type}@gramps.io`

      ical += `BEGIN:VEVENT
UID:${uid}
DTSTART;VALUE=DATE:${startDate}
DTEND;VALUE=DATE:${startDate}
SUMMARY:${event.title}
RRULE:FREQ=YEARLY
END:VEVENT
`
    }

    ical += 'END:VCALENDAR'

    return {
      format: 'ical',
      mimeType: 'text/calendar',
      filename: 'family-calendar.ics',
      content: ical,
      eventCount: events.length,
    }
  }

  /**
   * Format events as CSV
   */
  private formatCsv(events: any[]) {
    let csv = 'Type,Title,Month,Day,Original Date\n'

    for (const event of events) {
      csv += `${event.type},"${event.title}",${event.month},${event.day},"${event.date}"\n`
    }

    return {
      format: 'csv',
      mimeType: 'text/csv',
      filename: 'family-calendar.csv',
      content: csv,
      eventCount: events.length,
    }
  }

  /**
   * Get share buttons/links for social media
   */
  getShareLinks(entityType: string, entityId: string, url?: string) {
    const shareUrl = url || `https://gramps.io/${entityType.toLowerCase()}/${entityId}`
    const encodedUrl = encodeURIComponent(shareUrl)
    const title = `Family History on Gramps Web`
    const encodedTitle = encodeURIComponent(title)

    return {
      url: shareUrl,
      platforms: [
        {
          id: 'facebook',
          name: 'Facebook',
          url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          icon: 'facebook',
        },
        {
          id: 'twitter',
          name: 'Twitter/X',
          url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
          icon: 'twitter',
        },
        {
          id: 'linkedin',
          name: 'LinkedIn',
          url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
          icon: 'linkedin',
        },
        {
          id: 'pinterest',
          name: 'Pinterest',
          url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
          icon: 'pinterest',
        },
        {
          id: 'email',
          name: 'Email',
          url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
          icon: 'email',
        },
        {
          id: 'copy',
          name: 'Copy Link',
          url: shareUrl,
          icon: 'link',
          action: 'copy',
        },
      ],
    }
  }

  /**
   * Format lifespan string
   */
  private formatLifespan(birthDate?: string | null, deathDate?: string | null): string {
    const birthYear = birthDate ? this.extractYear(birthDate) : null
    const deathYear = deathDate ? this.extractYear(deathDate) : null

    if (birthYear && deathYear) {
      return `${birthYear}–${deathYear}`
    } else if (birthYear) {
      return `b. ${birthYear}`
    } else if (deathYear) {
      return `d. ${deathYear}`
    }
    return ''
  }

  /**
   * Extract year from date string
   */
  private extractYear(dateStr: string): string | null {
    if (!dateStr) return null
    const match = dateStr.match(/\b(\d{4})\b/)
    return match ? match[1] : null
  }

  /**
   * Parse date string to components
   */
  private parseDate(dateStr: string): {year?: number; month?: number; day?: number} | null {
    if (!dateStr) return null

    // Try ISO format: YYYY-MM-DD
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (isoMatch) {
      return {
        year: parseInt(isoMatch[1], 10),
        month: parseInt(isoMatch[2], 10),
        day: parseInt(isoMatch[3], 10),
      }
    }

    // Try other common formats
    const dateMatch = dateStr.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
    if (dateMatch) {
      return {
        month: parseInt(dateMatch[1], 10),
        day: parseInt(dateMatch[2], 10),
        year: parseInt(dateMatch[3], 10),
      }
    }

    return null
  }
}
