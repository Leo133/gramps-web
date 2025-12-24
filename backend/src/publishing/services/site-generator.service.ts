import {Injectable, NotFoundException, ConflictException} from '@nestjs/common'
import {PrismaService} from '../../prisma/prisma.service'
import {CreateSiteDto, UpdateSiteDto} from '../dto/publishing.dto'

@Injectable()
export class SiteGeneratorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Available themes for site generation
   */
  private themes = [
    {
      id: 'classic',
      name: 'Classic Heritage',
      description: 'Traditional family history design with sepia tones and elegant typography',
      preview: '/themes/classic/preview.jpg',
      colors: {primary: '#8B4513', secondary: '#D2691E', background: '#FDF5E6'},
    },
    {
      id: 'modern',
      name: 'Modern Minimal',
      description: 'Clean, contemporary design with focus on content',
      preview: '/themes/modern/preview.jpg',
      colors: {primary: '#1976D2', secondary: '#42A5F5', background: '#FFFFFF'},
    },
    {
      id: 'vintage',
      name: 'Vintage Album',
      description: 'Photo album style with decorative borders',
      preview: '/themes/vintage/preview.jpg',
      colors: {primary: '#4A4A4A', secondary: '#8B7355', background: '#F5F5DC'},
    },
    {
      id: 'nature',
      name: 'Nature & Roots',
      description: 'Organic design inspired by family trees and growth',
      preview: '/themes/nature/preview.jpg',
      colors: {primary: '#2E7D32', secondary: '#66BB6A', background: '#F1F8E9'},
    },
    {
      id: 'elegant',
      name: 'Elegant Script',
      description: 'Sophisticated design with script fonts and gold accents',
      preview: '/themes/elegant/preview.jpg',
      colors: {primary: '#B8860B', secondary: '#FFD700', background: '#FFFEF0'},
    },
  ]

  /**
   * Get available themes
   */
  getThemes() {
    return this.themes
  }

  /**
   * Create a new site configuration
   */
  async createSite(userId: string, dto: CreateSiteDto) {
    // Check if subdomain is already taken
    const existing = await this.prisma.publishedSite.findUnique({
      where: {subdomain: dto.subdomain},
    })

    if (existing) {
      throw new ConflictException('Subdomain is already taken')
    }

    // Validate theme
    if (dto.theme && !this.themes.find(t => t.id === dto.theme)) {
      throw new NotFoundException(`Theme '${dto.theme}' not found`)
    }

    const site = await this.prisma.publishedSite.create({
      data: {
        userId,
        name: dto.name,
        subdomain: dto.subdomain,
        customDomain: dto.customDomain,
        theme: dto.theme || 'classic',
        settings: dto.settings ? JSON.stringify(dto.settings) : null,
        status: 'draft',
      },
    })

    return this.formatSiteResponse(site)
  }

  /**
   * Get all sites for a user
   */
  async getUserSites(userId: string) {
    const sites = await this.prisma.publishedSite.findMany({
      where: {userId},
      orderBy: {createdAt: 'desc'},
    })

    return sites.map(site => this.formatSiteResponse(site))
  }

  /**
   * Get a specific site
   */
  async getSite(userId: string, siteId: string) {
    const site = await this.prisma.publishedSite.findFirst({
      where: {id: siteId, userId},
    })

    if (!site) {
      throw new NotFoundException('Site not found')
    }

    return this.formatSiteResponse(site)
  }

  /**
   * Update a site configuration
   */
  async updateSite(userId: string, siteId: string, dto: UpdateSiteDto) {
    const site = await this.prisma.publishedSite.findFirst({
      where: {id: siteId, userId},
    })

    if (!site) {
      throw new NotFoundException('Site not found')
    }

    // Validate theme if provided
    if (dto.theme && !this.themes.find(t => t.id === dto.theme)) {
      throw new NotFoundException(`Theme '${dto.theme}' not found`)
    }

    const updated = await this.prisma.publishedSite.update({
      where: {id: siteId},
      data: {
        name: dto.name,
        customDomain: dto.customDomain,
        theme: dto.theme,
        settings: dto.settings ? JSON.stringify(dto.settings) : undefined,
        status: dto.status,
      },
    })

    return this.formatSiteResponse(updated)
  }

  /**
   * Publish a site
   */
  async publishSite(userId: string, siteId: string) {
    const site = await this.prisma.publishedSite.findFirst({
      where: {id: siteId, userId},
    })

    if (!site) {
      throw new NotFoundException('Site not found')
    }

    // In a real implementation, this would:
    // 1. Generate static HTML/CSS/JS files
    // 2. Upload to CDN or hosting service
    // 3. Configure DNS if custom domain

    const updated = await this.prisma.publishedSite.update({
      where: {id: siteId},
      data: {
        status: 'published',
        lastPublished: new Date(),
      },
    })

    const baseUrl = updated.customDomain
      ? `https://${updated.customDomain}`
      : `https://${updated.subdomain}.gramps.io`

    return {
      status: 'published',
      url: baseUrl,
      publishedAt: updated.lastPublished,
      site: this.formatSiteResponse(updated),
    }
  }

  /**
   * Unpublish a site
   */
  async unpublishSite(userId: string, siteId: string) {
    const site = await this.prisma.publishedSite.findFirst({
      where: {id: siteId, userId},
    })

    if (!site) {
      throw new NotFoundException('Site not found')
    }

    const updated = await this.prisma.publishedSite.update({
      where: {id: siteId},
      data: {
        status: 'draft',
      },
    })

    return this.formatSiteResponse(updated)
  }

  /**
   * Delete a site
   */
  async deleteSite(userId: string, siteId: string) {
    const site = await this.prisma.publishedSite.findFirst({
      where: {id: siteId, userId},
    })

    if (!site) {
      throw new NotFoundException('Site not found')
    }

    await this.prisma.publishedSite.delete({
      where: {id: siteId},
    })

    return {success: true, message: 'Site deleted successfully'}
  }

  /**
   * Generate preview URL for a site
   */
  async getPreviewUrl(userId: string, siteId: string) {
    const site = await this.prisma.publishedSite.findFirst({
      where: {id: siteId, userId},
    })

    if (!site) {
      throw new NotFoundException('Site not found')
    }

    // Generate a temporary preview token
    const previewToken = Buffer.from(`${siteId}:${Date.now()}`).toString('base64url')

    return {
      previewUrl: `/preview/${previewToken}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    }
  }

  /**
   * Format site response
   */
  private formatSiteResponse(site: any) {
    const baseUrl = site.customDomain
      ? `https://${site.customDomain}`
      : `https://${site.subdomain}.gramps.io`

    return {
      id: site.id,
      name: site.name,
      subdomain: site.subdomain,
      customDomain: site.customDomain,
      theme: site.theme,
      settings: site.settings ? JSON.parse(site.settings) : null,
      status: site.status,
      url: site.status === 'published' ? baseUrl : null,
      lastPublished: site.lastPublished,
      createdAt: site.createdAt,
      updatedAt: site.updatedAt,
    }
  }
}
