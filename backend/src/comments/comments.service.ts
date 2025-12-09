import {Injectable, NotFoundException, ForbiddenException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'
import {CreateCommentDto, UpdateCommentDto} from './dto/comment.dto'

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateCommentDto) {
    const comment = await this.prisma.comment.create({
      data: {
        content: createDto.content,
        userId,
        entityType: createDto.entityType,
        entityId: createDto.entityId,
        parentId: createDto.parentId,
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

    return comment
  }

  async findAll(query?: {
    entityType?: string
    entityId?: string
    parentId?: string | null
    page?: number
    pagesize?: number
  }) {
    const {entityType, entityId, parentId, page = 1, pagesize = 50} = query || {}

    const where: any = {}

    if (entityType) {
      where.entityType = entityType
    }

    if (entityId) {
      where.entityId = entityId
    }

    // Support filtering for top-level comments (parentId is null)
    if (parentId !== undefined) {
      where.parentId = parentId
    }

    const skip = (Number(page) - 1) * Number(pagesize)
    const take = Number(pagesize)

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
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
      this.prisma.comment.count({where}),
    ])

    return {
      data: comments,
      total,
      page: Number(page),
      pagesize: Number(pagesize),
    }
  }

  async findOne(id: string) {
    const comment = await this.prisma.comment.findUnique({
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

    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`)
    }

    return comment
  }

  async update(id: string, userId: string, updateDto: UpdateCommentDto) {
    const comment = await this.findOne(id)

    // Only the author can edit their comment
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments')
    }

    const updated = await this.prisma.comment.update({
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
    const comment = await this.findOne(id)

    // Only the author or an editor/owner can delete
    if (comment.userId !== userId && !['editor', 'owner'].includes(userRole)) {
      throw new ForbiddenException('You can only delete your own comments')
    }

    await this.prisma.comment.delete({
      where: {id},
    })

    return {message: 'Comment deleted successfully'}
  }
}
