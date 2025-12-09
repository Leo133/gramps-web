import {Injectable, NotFoundException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'
import {CreateActivityDto} from './dto/activity.dto'
import {Prisma} from '@prisma/client'

@Injectable()
export class ActivityFeedService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateActivityDto) {
    const activity = await this.prisma.activity.create({
      data: {
        userId,
        action: createDto.action,
        entityType: createDto.entityType,
        entityId: createDto.entityId,
        entityName: createDto.entityName,
        details: createDto.details,
        visibility: createDto.visibility || 'all',
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

    return activity
  }

  async findAll(query?: {
    entityType?: string
    entityId?: string
    visibility?: string
    userRole?: string
    page?: number
    pagesize?: number
  }) {
    const {entityType, entityId, visibility, userRole, page = 1, pagesize = 50} = query || {}

    const where: Prisma.ActivityWhereInput = {}

    if (entityType) {
      where.entityType = entityType
    }

    if (entityId) {
      where.entityId = entityId
    }

    // Filter by visibility based on user role
    if (visibility) {
      where.visibility = visibility
    } else if (userRole) {
      // Show appropriate activities based on user role
      if (userRole === 'owner') {
        // Owners see all activities
      } else if (userRole === 'editor') {
        // Editors see all except owner-only
        where.visibility = {in: ['all', 'editors']}
      } else {
        // Others see only public activities
        where.visibility = 'all'
      }
    }

    const skip = (Number(page) - 1) * Number(pagesize)
    const take = Number(pagesize)

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
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
      this.prisma.activity.count({where}),
    ])

    return {
      data: activities,
      total,
      page: Number(page),
      pagesize: Number(pagesize),
    }
  }

  async findOne(id: string) {
    const activity = await this.prisma.activity.findUnique({
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

    if (!activity) {
      throw new NotFoundException(`Activity with id ${id} not found`)
    }

    return activity
  }

  // Helper method to create activity log for common actions
  async logActivity(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    entityName?: string,
    details?: any,
  ) {
    return this.create(userId, {
      action,
      entityType,
      entityId,
      entityName,
      details: details ? JSON.stringify(details) : undefined,
      visibility: 'all',
    })
  }
}
