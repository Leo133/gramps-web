import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common'
import {PrismaService} from '../../prisma/prisma.service'
import {CreateShareLinkDto, AccessShareDto} from '../dto/publishing.dto'
import * as crypto from 'crypto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class ShareLinkService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new share link
   */
  async createShareLink(userId: string, dto: CreateShareLinkDto) {
    // Generate a secure token
    const token = this.generateSecureToken()

    // Hash password if provided
    let hashedPassword = null
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10)
    }

    const shareLink = await this.prisma.shareLink.create({
      data: {
        userId,
        token,
        name: dto.name,
        entityType: dto.entityType,
        entityId: dto.entityId,
        privacyLevel: dto.privacyLevel || 'public',
        maxGenerations: dto.maxGenerations,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        password: hashedPassword,
        maxViews: dto.maxViews,
      },
    })

    return this.formatShareLinkResponse(shareLink, true)
  }

  /**
   * Get all share links for a user
   */
  async getUserShareLinks(userId: string) {
    const links = await this.prisma.shareLink.findMany({
      where: {userId},
      orderBy: {createdAt: 'desc'},
    })

    return links.map(link => this.formatShareLinkResponse(link, false))
  }

  /**
   * Get a specific share link
   */
  async getShareLink(userId: string, linkId: string) {
    const link = await this.prisma.shareLink.findFirst({
      where: {id: linkId, userId},
    })

    if (!link) {
      throw new NotFoundException('Share link not found')
    }

    return this.formatShareLinkResponse(link, false)
  }

  /**
   * Disable a share link
   */
  async disableShareLink(userId: string, linkId: string) {
    const link = await this.prisma.shareLink.findFirst({
      where: {id: linkId, userId},
    })

    if (!link) {
      throw new NotFoundException('Share link not found')
    }

    await this.prisma.shareLink.update({
      where: {id: linkId},
      data: {enabled: false},
    })

    return {success: true, message: 'Share link disabled'}
  }

  /**
   * Enable a share link
   */
  async enableShareLink(userId: string, linkId: string) {
    const link = await this.prisma.shareLink.findFirst({
      where: {id: linkId, userId},
    })

    if (!link) {
      throw new NotFoundException('Share link not found')
    }

    await this.prisma.shareLink.update({
      where: {id: linkId},
      data: {enabled: true},
    })

    return {success: true, message: 'Share link enabled'}
  }

  /**
   * Delete a share link
   */
  async deleteShareLink(userId: string, linkId: string) {
    const link = await this.prisma.shareLink.findFirst({
      where: {id: linkId, userId},
    })

    if (!link) {
      throw new NotFoundException('Share link not found')
    }

    await this.prisma.shareLink.delete({
      where: {id: linkId},
    })

    return {success: true, message: 'Share link deleted'}
  }

  /**
   * Access shared content (public - no auth required)
   */
  async accessSharedContent(token: string, dto?: AccessShareDto) {
    const link = await this.prisma.shareLink.findUnique({
      where: {token},
    })

    if (!link) {
      throw new NotFoundException('Share link not found or has expired')
    }

    // Check if link is enabled
    if (!link.enabled) {
      throw new ForbiddenException('This share link has been disabled')
    }

    // Check expiration
    if (link.expiresAt && new Date() > link.expiresAt) {
      throw new ForbiddenException('This share link has expired')
    }

    // Check view count
    if (link.maxViews && link.viewCount >= link.maxViews) {
      throw new ForbiddenException('This share link has reached its maximum view count')
    }

    // Check password
    if (link.password) {
      if (!dto?.password) {
        throw new UnauthorizedException('Password required to access this share')
      }

      const passwordValid = await bcrypt.compare(dto.password, link.password)
      if (!passwordValid) {
        throw new UnauthorizedException('Invalid password')
      }
    }

    // Increment view count
    await this.prisma.shareLink.update({
      where: {id: link.id},
      data: {viewCount: {increment: 1}},
    })

    // Get the shared content based on entity type
    const content = await this.getSharedContent(link)

    return {
      entityType: link.entityType,
      entityId: link.entityId,
      privacyLevel: link.privacyLevel,
      content,
    }
  }

  /**
   * Get shared content with privacy filtering
   */
  private async getSharedContent(link: any) {
    switch (link.entityType) {
      case 'Person':
        return this.getPersonContent(link.entityId, link.privacyLevel, link.maxGenerations)
      case 'Family':
        return this.getFamilyContent(link.entityId, link.privacyLevel)
      case 'Branch':
        return this.getBranchContent(link.entityId, link.privacyLevel, link.maxGenerations)
      default:
        throw new BadRequestException(`Unknown entity type: ${link.entityType}`)
    }
  }

  /**
   * Get person content with privacy filtering
   */
  private async getPersonContent(entityId: string, privacyLevel: string, maxGenerations?: number) {
    const person = await this.prisma.person.findUnique({
      where: {handle: entityId},
    })

    if (!person) {
      throw new NotFoundException('Person not found')
    }

    // Apply privacy filtering
    const filteredPerson = this.applyPrivacyFilter(person, privacyLevel)

    // Get ancestors and descendants based on maxGenerations
    const generations = maxGenerations || 5

    return {
      person: filteredPerson,
      ancestors: await this.getAncestors(entityId, generations, privacyLevel),
      descendants: await this.getDescendants(entityId, generations, privacyLevel),
    }
  }

  /**
   * Get family content with privacy filtering
   */
  private async getFamilyContent(entityId: string, privacyLevel: string) {
    const family = await this.prisma.family.findUnique({
      where: {handle: entityId},
    })

    if (!family) {
      throw new NotFoundException('Family not found')
    }

    // Get family members
    const father = family.fatherHandle
      ? await this.prisma.person.findUnique({where: {handle: family.fatherHandle}})
      : null
    const mother = family.motherHandle
      ? await this.prisma.person.findUnique({where: {handle: family.motherHandle}})
      : null

    // Parse children handles
    const childHandles = family.childRefList ? JSON.parse(family.childRefList) : []
    const children = await Promise.all(
      childHandles.map(async (handle: string) =>
        this.prisma.person.findUnique({where: {handle}}),
      ),
    )

    return {
      family,
      father: father ? this.applyPrivacyFilter(father, privacyLevel) : null,
      mother: mother ? this.applyPrivacyFilter(mother, privacyLevel) : null,
      children: children.filter(Boolean).map(c => this.applyPrivacyFilter(c, privacyLevel)),
    }
  }

  /**
   * Get branch content (person with full tree)
   */
  private async getBranchContent(entityId: string, privacyLevel: string, maxGenerations?: number) {
    return this.getPersonContent(entityId, privacyLevel, maxGenerations)
  }

  /**
   * Get ancestors for a person
   */
  private async getAncestors(personHandle: string, generations: number, privacyLevel: string) {
    if (generations <= 0) return []

    // Find families where this person is a child
    const families = await this.prisma.family.findMany()
    const parentFamilies = families.filter(f => {
      const children = f.childRefList ? JSON.parse(f.childRefList) : []
      return children.includes(personHandle)
    })

    const ancestors: any[] = []

    for (const family of parentFamilies) {
      if (family.fatherHandle) {
        const father = await this.prisma.person.findUnique({where: {handle: family.fatherHandle}})
        if (father) {
          const filtered = this.applyPrivacyFilter(father, privacyLevel)
          ancestors.push({
            ...filtered,
            ancestors: await this.getAncestors(family.fatherHandle, generations - 1, privacyLevel),
          })
        }
      }

      if (family.motherHandle) {
        const mother = await this.prisma.person.findUnique({where: {handle: family.motherHandle}})
        if (mother) {
          const filtered = this.applyPrivacyFilter(mother, privacyLevel)
          ancestors.push({
            ...filtered,
            ancestors: await this.getAncestors(family.motherHandle, generations - 1, privacyLevel),
          })
        }
      }
    }

    return ancestors
  }

  /**
   * Get descendants for a person
   */
  private async getDescendants(personHandle: string, generations: number, privacyLevel: string) {
    if (generations <= 0) return []

    // Find families where this person is a parent
    const families = await this.prisma.family.findMany({
      where: {
        OR: [{fatherHandle: personHandle}, {motherHandle: personHandle}],
      },
    })

    const descendants: any[] = []

    for (const family of families) {
      const childHandles = family.childRefList ? JSON.parse(family.childRefList) : []

      for (const childHandle of childHandles) {
        const child = await this.prisma.person.findUnique({where: {handle: childHandle}})
        if (child) {
          const filtered = this.applyPrivacyFilter(child, privacyLevel)
          descendants.push({
            ...filtered,
            descendants: await this.getDescendants(childHandle, generations - 1, privacyLevel),
          })
        }
      }
    }

    return descendants
  }

  /**
   * Apply privacy filtering to a person
   */
  private applyPrivacyFilter(person: any, privacyLevel: string) {
    // Check if person is living
    const isLiving = this.isPersonLiving(person)

    switch (privacyLevel) {
      case 'all':
        // Show all details
        return person

      case 'living':
        // Only show living persons
        if (!isLiving) return null
        return person

      case 'deceased':
        // Only show deceased persons
        if (isLiving) {
          return {
            handle: person.handle,
            grampsId: person.grampsId,
            firstName: '[Living]',
            surname: person.surname,
            gender: person.gender,
            private: true,
            isLiving: true,
          }
        }
        return person

      case 'public':
      default:
        // Hide all living persons' details
        if (isLiving || person.private) {
          return {
            handle: person.handle,
            grampsId: person.grampsId,
            firstName: '[Living]',
            surname: person.surname,
            gender: person.gender,
            private: true,
            isLiving: true,
          }
        }
        return person
    }
  }

  /**
   * Check if a person is living
   */
  private isPersonLiving(person: any): boolean {
    // If death date exists, person is deceased
    if (person.deathDate) {
      return false
    }

    // If no death date, check birth date
    if (person.birthDate) {
      const birthYear = this.extractYear(person.birthDate)
      if (birthYear) {
        const age = new Date().getFullYear() - birthYear
        // Assume deceased if older than 110
        return age < 110
      }
    }

    // Default to living if no dates available
    return true
  }

  /**
   * Extract year from date string
   */
  private extractYear(dateStr: string): number | null {
    if (!dateStr) return null

    // Try various date formats
    const match = dateStr.match(/\b(\d{4})\b/)
    return match ? parseInt(match[1], 10) : null
  }

  /**
   * Generate a secure random token
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(24).toString('base64url')
  }

  /**
   * Format share link response
   */
  private formatShareLinkResponse(link: any, includeToken: boolean) {
    return {
      id: link.id,
      name: link.name,
      token: includeToken ? link.token : undefined,
      shareUrl: `https://gramps.io/share/${link.token}`,
      entityType: link.entityType,
      entityId: link.entityId,
      privacyLevel: link.privacyLevel,
      maxGenerations: link.maxGenerations,
      expiresAt: link.expiresAt,
      hasPassword: !!link.password,
      viewCount: link.viewCount,
      maxViews: link.maxViews,
      enabled: link.enabled,
      createdAt: link.createdAt,
    }
  }
}
