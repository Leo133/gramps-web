import {Injectable, NotFoundException, BadRequestException} from '@nestjs/common'
import {PrismaService} from '../../prisma/prisma.service'
import {CreateWebhookDto} from '../dto/publishing.dto'
import * as crypto from 'crypto'

@Injectable()
export class WebhookService {
  constructor(private prisma: PrismaService) {}

  /**
   * Available webhook event types
   */
  private eventTypes = [
    // Person events
    {id: 'person.created', name: 'Person Created', description: 'When a new person is added'},
    {id: 'person.updated', name: 'Person Updated', description: 'When a person is modified'},
    {id: 'person.deleted', name: 'Person Deleted', description: 'When a person is removed'},

    // Family events
    {id: 'family.created', name: 'Family Created', description: 'When a new family is created'},
    {id: 'family.updated', name: 'Family Updated', description: 'When a family is modified'},
    {id: 'family.deleted', name: 'Family Deleted', description: 'When a family is removed'},

    // Media events
    {id: 'media.uploaded', name: 'Media Uploaded', description: 'When new media is uploaded'},
    {id: 'media.deleted', name: 'Media Deleted', description: 'When media is removed'},

    // Export events
    {id: 'export.completed', name: 'Export Completed', description: 'When an export job completes'},
    {id: 'export.failed', name: 'Export Failed', description: 'When an export job fails'},

    // User events
    {id: 'user.invited', name: 'User Invited', description: 'When a new user is invited'},
    {id: 'user.joined', name: 'User Joined', description: 'When an invited user joins'},

    // Backup events
    {id: 'backup.completed', name: 'Backup Completed', description: 'When a backup completes'},
    {id: 'backup.failed', name: 'Backup Failed', description: 'When a backup fails'},
  ]

  /**
   * Create a new webhook
   */
  async createWebhook(userId: string, dto: CreateWebhookDto) {
    // Validate URL
    if (!dto.url.startsWith('https://')) {
      throw new BadRequestException('Webhook URL must use HTTPS')
    }

    // Validate events
    for (const event of dto.events) {
      if (!this.eventTypes.find(e => e.id === event)) {
        throw new BadRequestException(`Invalid event type: ${event}`)
      }
    }

    // Generate webhook secret
    const secret = this.generateWebhookSecret()

    const webhook = await this.prisma.webhook.create({
      data: {
        userId,
        name: dto.name,
        url: dto.url,
        events: JSON.stringify(dto.events),
        secret,
      },
    })

    // Return the secret only once (user must save it)
    return {
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: dto.events,
      secret, // Only shown once!
      enabled: webhook.enabled,
      createdAt: webhook.createdAt,
      warning: 'Save this webhook secret securely. It will not be shown again.',
    }
  }

  /**
   * Get all webhooks for a user
   */
  async getUserWebhooks(userId: string) {
    const webhooks = await this.prisma.webhook.findMany({
      where: {userId},
      orderBy: {createdAt: 'desc'},
    })

    return webhooks.map(webhook => this.formatWebhookResponse(webhook))
  }

  /**
   * Get a specific webhook
   */
  async getWebhook(userId: string, webhookId: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: {id: webhookId, userId},
    })

    if (!webhook) {
      throw new NotFoundException('Webhook not found')
    }

    return this.formatWebhookResponse(webhook)
  }

  /**
   * Update a webhook
   */
  async updateWebhook(
    userId: string,
    webhookId: string,
    dto: Partial<CreateWebhookDto> & {enabled?: boolean},
  ) {
    const webhook = await this.prisma.webhook.findFirst({
      where: {id: webhookId, userId},
    })

    if (!webhook) {
      throw new NotFoundException('Webhook not found')
    }

    // Validate URL if provided
    if (dto.url && !dto.url.startsWith('https://')) {
      throw new BadRequestException('Webhook URL must use HTTPS')
    }

    // Validate events if provided
    if (dto.events) {
      for (const event of dto.events) {
        if (!this.eventTypes.find(e => e.id === event)) {
          throw new BadRequestException(`Invalid event type: ${event}`)
        }
      }
    }

    const updated = await this.prisma.webhook.update({
      where: {id: webhookId},
      data: {
        name: dto.name,
        url: dto.url,
        events: dto.events ? JSON.stringify(dto.events) : undefined,
        enabled: dto.enabled,
      },
    })

    return this.formatWebhookResponse(updated)
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(userId: string, webhookId: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: {id: webhookId, userId},
    })

    if (!webhook) {
      throw new NotFoundException('Webhook not found')
    }

    await this.prisma.webhook.delete({
      where: {id: webhookId},
    })

    return {success: true, message: 'Webhook deleted'}
  }

  /**
   * Test a webhook by sending a test payload
   */
  async testWebhook(userId: string, webhookId: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: {id: webhookId, userId},
    })

    if (!webhook) {
      throw new NotFoundException('Webhook not found')
    }

    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook from Gramps Web',
        webhookId: webhook.id,
        webhookName: webhook.name,
      },
    }

    // Generate signature
    const signature = this.generateSignature(JSON.stringify(testPayload), webhook.secret)

    // In a real implementation, this would make an HTTP request
    // For now, return what would be sent
    return {
      success: true,
      message: 'Test webhook sent (simulated)',
      payload: testPayload,
      headers: {
        'Content-Type': 'application/json',
        'X-Gramps-Signature': signature,
        'X-Gramps-Timestamp': new Date().toISOString(),
      },
    }
  }

  /**
   * Trigger webhooks for an event
   */
  async triggerWebhooks(eventType: string, data: any) {
    // Find all webhooks subscribed to this event
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        enabled: true,
        failCount: {lt: 5}, // Don't trigger if too many failures
      },
    })

    const triggeredWebhooks = webhooks.filter(webhook => {
      const events = JSON.parse(webhook.events)
      return events.includes(eventType)
    })

    const results = await Promise.all(
      triggeredWebhooks.map(async webhook => {
        try {
          await this.sendWebhook(webhook, eventType, data)
          return {webhookId: webhook.id, success: true}
        } catch (error) {
          return {webhookId: webhook.id, success: false, error: error.message}
        }
      }),
    )

    return {
      event: eventType,
      triggered: triggeredWebhooks.length,
      results,
    }
  }

  /**
   * Send webhook payload
   */
  private async sendWebhook(webhook: any, eventType: string, data: any) {
    const payload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data,
    }

    const payloadString = JSON.stringify(payload)
    const signature = this.generateSignature(payloadString, webhook.secret)

    // In a real implementation, this would use fetch or axios
    // For now, simulate the request
    console.log(`Webhook delivery to ${webhook.url}:`, {
      event: eventType,
      signature,
    })

    // Update last triggered
    await this.prisma.webhook.update({
      where: {id: webhook.id},
      data: {
        lastTriggered: new Date(),
        failCount: 0, // Reset fail count on success
      },
    })

    return {success: true}
  }

  /**
   * Get available event types
   */
  getEventTypes() {
    return this.eventTypes
  }

  /**
   * Generate webhook secret
   */
  private generateWebhookSecret(): string {
    return 'whsec_' + crypto.randomBytes(32).toString('base64url')
  }

  /**
   * Generate HMAC signature for payload
   */
  private generateSignature(payload: string, secret: string): string {
    return 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex')
  }

  /**
   * Format webhook response
   */
  private formatWebhookResponse(webhook: any) {
    return {
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: JSON.parse(webhook.events),
      enabled: webhook.enabled,
      lastTriggered: webhook.lastTriggered,
      failCount: webhook.failCount,
      createdAt: webhook.createdAt,
    }
  }
}
