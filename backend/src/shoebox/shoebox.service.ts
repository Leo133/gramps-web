import {Injectable, NotFoundException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

export interface CreateShoeboxItemDto {
  itemType: 'text' | 'image' | 'url' | 'file'
  title?: string
  content: string
  metadata?: any
  tags?: string[]
}

export interface UpdateShoeboxItemDto {
  title?: string
  content?: string
  metadata?: any
  tags?: string[]
  attachedTo?: any
}

@Injectable()
export class ShoeboxService {
  constructor(private prisma: PrismaService) {}

  /**
   * Add item to shoebox
   */
  async addItem(userId: string, data: CreateShoeboxItemDto): Promise<any> {
    return this.prisma.shoeboxItem.create({
      data: {
        userId,
        itemType: data.itemType,
        title: data.title,
        content: data.content,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        tags: data.tags ? JSON.stringify(data.tags) : null,
      },
    })
  }

  /**
   * Get all shoebox items for a user
   */
  async getUserItems(
    userId: string,
    options?: {
      itemType?: string
      tag?: string
    },
  ): Promise<any[]> {
    const items = await this.prisma.shoeboxItem.findMany({
      where: {
        userId,
        ...(options?.itemType ? {itemType: options.itemType} : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Parse JSON fields
    let parsedItems = items.map(item => ({
      ...item,
      metadata: item.metadata ? JSON.parse(item.metadata) : null,
      tags: item.tags ? JSON.parse(item.tags) : [],
      attachedTo: item.attachedTo ? JSON.parse(item.attachedTo) : null,
    }))

    // Filter by tag if specified
    if (options?.tag) {
      parsedItems = parsedItems.filter(item => item.tags.includes(options.tag))
    }

    return parsedItems
  }

  /**
   * Get a single shoebox item
   */
  async getItem(itemId: string, userId: string): Promise<any> {
    const item = await this.prisma.shoeboxItem.findFirst({
      where: {id: itemId, userId},
    })

    if (!item) {
      throw new NotFoundException('Item not found')
    }

    return {
      ...item,
      metadata: item.metadata ? JSON.parse(item.metadata) : null,
      tags: item.tags ? JSON.parse(item.tags) : [],
      attachedTo: item.attachedTo ? JSON.parse(item.attachedTo) : null,
    }
  }

  /**
   * Update a shoebox item
   */
  async updateItem(
    itemId: string,
    userId: string,
    data: UpdateShoeboxItemDto,
  ): Promise<any> {
    const item = await this.prisma.shoeboxItem.findFirst({
      where: {id: itemId, userId},
    })

    if (!item) {
      throw new NotFoundException('Item not found')
    }

    const updateData: any = {...data}

    // Convert objects to JSON strings
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata ? JSON.stringify(data.metadata) : null
    }
    if (data.tags !== undefined) {
      updateData.tags = data.tags ? JSON.stringify(data.tags) : null
    }
    if (data.attachedTo !== undefined) {
      updateData.attachedTo = data.attachedTo
        ? JSON.stringify(data.attachedTo)
        : null
    }

    return this.prisma.shoeboxItem.update({
      where: {id: itemId},
      data: updateData,
    })
  }

  /**
   * Delete a shoebox item
   */
  async deleteItem(itemId: string, userId: string): Promise<void> {
    const item = await this.prisma.shoeboxItem.findFirst({
      where: {id: itemId, userId},
    })

    if (!item) {
      throw new NotFoundException('Item not found')
    }

    await this.prisma.shoeboxItem.delete({
      where: {id: itemId},
    })
  }

  /**
   * Attach shoebox item to a genealogy entity
   */
  async attachToEntity(
    itemId: string,
    userId: string,
    entityType: string,
    entityHandle: string,
  ): Promise<any> {
    const item = await this.prisma.shoeboxItem.findFirst({
      where: {id: itemId, userId},
    })

    if (!item) {
      throw new NotFoundException('Item not found')
    }

    const attachedTo = {entityType, entityHandle}

    return this.prisma.shoeboxItem.update({
      where: {id: itemId},
      data: {
        attachedTo: JSON.stringify(attachedTo),
      },
    })
  }

  /**
   * Get statistics
   */
  async getStatistics(userId: string): Promise<any> {
    const items = await this.prisma.shoeboxItem.findMany({
      where: {userId},
    })

    return {
      total: items.length,
      byType: {
        text: items.filter(i => i.itemType === 'text').length,
        image: items.filter(i => i.itemType === 'image').length,
        url: items.filter(i => i.itemType === 'url').length,
        file: items.filter(i => i.itemType === 'file').length,
      },
      attached: items.filter(i => i.attachedTo).length,
      unattached: items.filter(i => !i.attachedTo).length,
    }
  }
}
