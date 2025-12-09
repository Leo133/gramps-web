import {Injectable, NotFoundException, ForbiddenException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'
import {CreateChatMessageDto, UpdateChatMessageDto} from './dto/chat.dto'
import {Prisma} from '@prisma/client'

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateChatMessageDto) {
    const message = await this.prisma.chatMessage.create({
      data: {
        content: createDto.content,
        userId,
        channelId: createDto.channelId,
        contextType: createDto.contextType,
        contextId: createDto.contextId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    })

    return message
  }

  async findAll(query?: {
    channelId?: string
    contextType?: string
    contextId?: string
    page?: number
    pagesize?: number
  }) {
    const {channelId, contextType, contextId, page = 1, pagesize = 50} = query || {}

    const where: Prisma.ChatMessageWhereInput = {}

    if (channelId) {
      where.channelId = channelId
    }

    if (contextType && contextId) {
      where.contextType = contextType
      where.contextId = contextId
    }

    const skip = (Number(page) - 1) * Number(pagesize)
    const take = Number(pagesize)

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where,
        skip,
        take,
        orderBy: {createdAt: 'desc'},
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      }),
      this.prisma.chatMessage.count({where}),
    ])

    return {
      data: messages,
      total,
      page: Number(page),
      pagesize: Number(pagesize),
    }
  }

  async findOne(id: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: {id},
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    })

    if (!message) {
      throw new NotFoundException(`Chat message with id ${id} not found`)
    }

    return message
  }

  async update(id: string, userId: string, updateDto: UpdateChatMessageDto) {
    const message = await this.findOne(id)

    // Only the author can edit their message
    if (message.userId !== userId) {
      throw new ForbiddenException('You can only edit your own messages')
    }

    const updated = await this.prisma.chatMessage.update({
      where: {id},
      data: {
        content: updateDto.content,
        edited: true,
        editedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    })

    return updated
  }

  async remove(id: string, userId: string, userRole: string) {
    const message = await this.findOne(id)

    // Only the author or an editor/owner can delete
    if (message.userId !== userId && !['editor', 'owner'].includes(userRole)) {
      throw new ForbiddenException('You can only delete your own messages')
    }

    await this.prisma.chatMessage.delete({
      where: {id},
    })

    return {message: 'Chat message deleted successfully'}
  }
}
