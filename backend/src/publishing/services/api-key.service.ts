import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import {PrismaService} from '../../prisma/prisma.service'
import {CreateApiKeyDto} from '../dto/publishing.dto'
import * as crypto from 'crypto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class ApiKeyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Available permissions for API keys
   */
  private permissions = [
    // Read permissions
    {id: 'read:people', name: 'Read People', description: 'View person records'},
    {id: 'read:families', name: 'Read Families', description: 'View family records'},
    {id: 'read:events', name: 'Read Events', description: 'View event records'},
    {id: 'read:places', name: 'Read Places', description: 'View place records'},
    {id: 'read:media', name: 'Read Media', description: 'View media files'},
    {id: 'read:sources', name: 'Read Sources', description: 'View source records'},
    {id: 'read:notes', name: 'Read Notes', description: 'View note records'},

    // Write permissions
    {id: 'write:people', name: 'Write People', description: 'Create and update person records'},
    {id: 'write:families', name: 'Write Families', description: 'Create and update family records'},
    {id: 'write:events', name: 'Write Events', description: 'Create and update event records'},
    {id: 'write:places', name: 'Write Places', description: 'Create and update place records'},
    {id: 'write:media', name: 'Write Media', description: 'Upload and update media files'},
    {id: 'write:sources', name: 'Write Sources', description: 'Create and update source records'},
    {id: 'write:notes', name: 'Write Notes', description: 'Create and update note records'},

    // Special permissions
    {id: 'visualizations', name: 'Visualizations', description: 'Access chart and visualization APIs'},
    {id: 'search', name: 'Search', description: 'Use search APIs'},
    {id: 'export', name: 'Export', description: 'Export data in various formats'},
  ]

  /**
   * Create a new API key
   */
  async createApiKey(userId: string, dto: CreateApiKeyDto) {
    // Validate permissions
    for (const perm of dto.permissions) {
      if (!this.permissions.find(p => p.id === perm)) {
        throw new BadRequestException(`Invalid permission: ${perm}`)
      }
    }

    // Generate secure API key
    const rawKey = this.generateApiKey()
    const keyPrefix = rawKey.slice(0, 12)
    const keyHash = await bcrypt.hash(rawKey, 10)

    const apiKey = await this.prisma.apiKey.create({
      data: {
        userId,
        name: dto.name,
        keyPrefix,
        keyHash,
        permissions: JSON.stringify(dto.permissions),
        rateLimit: dto.rateLimit || 1000,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    })

    // Return the full key only once (user must save it)
    return {
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey, // Only returned once!
      keyPrefix: keyPrefix + '...',
      permissions: dto.permissions,
      rateLimit: apiKey.rateLimit,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      warning: 'Save this API key securely. It will not be shown again.',
    }
  }

  /**
   * Get all API keys for a user (without full keys)
   */
  async getUserApiKeys(userId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: {userId},
      orderBy: {createdAt: 'desc'},
    })

    return keys.map(key => this.formatApiKeyResponse(key))
  }

  /**
   * Get a specific API key
   */
  async getApiKey(userId: string, keyId: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: {id: keyId, userId},
    })

    if (!key) {
      throw new NotFoundException('API key not found')
    }

    return this.formatApiKeyResponse(key)
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(userId: string, keyId: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: {id: keyId, userId},
    })

    if (!key) {
      throw new NotFoundException('API key not found')
    }

    await this.prisma.apiKey.delete({
      where: {id: keyId},
    })

    return {success: true, message: 'API key revoked'}
  }

  /**
   * Enable/disable an API key
   */
  async toggleApiKey(userId: string, keyId: string, enabled: boolean) {
    const key = await this.prisma.apiKey.findFirst({
      where: {id: keyId, userId},
    })

    if (!key) {
      throw new NotFoundException('API key not found')
    }

    await this.prisma.apiKey.update({
      where: {id: keyId},
      data: {enabled},
    })

    return {success: true, message: `API key ${enabled ? 'enabled' : 'disabled'}`}
  }

  /**
   * Validate an API key and return user info
   */
  async validateApiKey(rawKey: string) {
    // Extract prefix for quick lookup
    const keyPrefix = rawKey.slice(0, 12)

    const apiKey = await this.prisma.apiKey.findFirst({
      where: {keyPrefix},
    })

    if (!apiKey) {
      throw new UnauthorizedException('Invalid API key')
    }

    // Verify full key hash
    const isValid = await bcrypt.compare(rawKey, apiKey.keyHash)
    if (!isValid) {
      throw new UnauthorizedException('Invalid API key')
    }

    // Check if enabled
    if (!apiKey.enabled) {
      throw new UnauthorizedException('API key is disabled')
    }

    // Check expiration
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      throw new UnauthorizedException('API key has expired')
    }

    // Update last used timestamp
    await this.prisma.apiKey.update({
      where: {id: apiKey.id},
      data: {lastUsed: new Date()},
    })

    return {
      userId: apiKey.userId,
      keyId: apiKey.id,
      permissions: JSON.parse(apiKey.permissions),
      rateLimit: apiKey.rateLimit,
    }
  }

  /**
   * Check if API key has required permission
   */
  async checkPermission(rawKey: string, requiredPermission: string): Promise<boolean> {
    const validation = await this.validateApiKey(rawKey)
    return validation.permissions.includes(requiredPermission)
  }

  /**
   * Get available permissions
   */
  getAvailablePermissions() {
    return this.permissions
  }

  /**
   * Get API key usage statistics
   */
  async getApiKeyStats(userId: string, keyId: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: {id: keyId, userId},
    })

    if (!key) {
      throw new NotFoundException('API key not found')
    }

    // In a real implementation, this would query usage logs
    return {
      keyId: key.id,
      name: key.name,
      lastUsed: key.lastUsed,
      rateLimit: key.rateLimit,
      // Mock usage statistics
      usage: {
        today: Math.floor(Math.random() * key.rateLimit),
        thisWeek: Math.floor(Math.random() * key.rateLimit * 7),
        thisMonth: Math.floor(Math.random() * key.rateLimit * 30),
      },
    }
  }

  /**
   * Generate a secure API key
   */
  private generateApiKey(): string {
    const prefix = 'gw_live_' // Gramps Web live key prefix
    const randomPart = crypto.randomBytes(32).toString('base64url')
    return prefix + randomPart
  }

  /**
   * Format API key response (without sensitive data)
   */
  private formatApiKeyResponse(key: any) {
    return {
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix + '...',
      permissions: JSON.parse(key.permissions),
      rateLimit: key.rateLimit,
      lastUsed: key.lastUsed,
      expiresAt: key.expiresAt,
      enabled: key.enabled,
      createdAt: key.createdAt,
    }
  }
}
