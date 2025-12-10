import {Injectable} from '@nestjs/common'
import {PrismaService} from '../../prisma/prisma.service'

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log a change to the audit log
   */
  async logChange(data: {
    userId: string
    action: string
    entityType: string
    entityId: string
    changes?: any
    ipAddress?: string
    userAgent?: string
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        changes: data.changes ? JSON.stringify(data.changes) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })
  }

  /**
   * Get all audit logs with optional filters
   */
  async findAll(params?: {
    userId?: string
    entityType?: string
    entityId?: string
    action?: string
    startDate?: Date
    endDate?: Date
    page?: number
    perPage?: number
  }) {
    const {
      userId,
      entityType,
      entityId,
      action,
      startDate,
      endDate,
      page = 1,
      perPage = 50,
    } = params || {}

    const where: any = {}
    if (userId) where.userId = userId
    if (entityType) where.entityType = entityType
    if (entityId) where.entityId = entityId
    if (action) where.action = action
    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) where.timestamp.gte = startDate
      if (endDate) where.timestamp.lte = endDate
    }

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({where}),
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              role: true,
            },
          },
        },
        orderBy: {timestamp: 'desc'},
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ])

    return {
      data: logs.map(log => ({
        ...log,
        changes: log.changes ? JSON.parse(log.changes) : null,
      })),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  /**
   * Get audit log for a specific entity
   */
  async findByEntity(entityType: string, entityId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
        rolledBack: false,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: {timestamp: 'desc'},
    })

    return logs.map(log => ({
      ...log,
      changes: log.changes ? JSON.parse(log.changes) : null,
    }))
  }

  /**
   * Get audit log statistics
   */
  async getStatistics(startDate?: Date, endDate?: Date) {
    const where: any = {}
    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) where.timestamp.gte = startDate
      if (endDate) where.timestamp.lte = endDate
    }

    const [totalLogs, actionCounts, entityTypeCounts, userActivity] =
      await Promise.all([
        this.prisma.auditLog.count({where}),
        this.prisma.auditLog.groupBy({
          by: ['action'],
          where,
          _count: true,
        }),
        this.prisma.auditLog.groupBy({
          by: ['entityType'],
          where,
          _count: true,
        }),
        this.prisma.auditLog.groupBy({
          by: ['userId'],
          where,
          _count: true,
          orderBy: {_count: {userId: 'desc'}},
          take: 10,
        }),
      ])

    return {
      totalLogs,
      actionCounts: actionCounts.map(item => ({
        action: item.action,
        count: item._count,
      })),
      entityTypeCounts: entityTypeCounts.map(item => ({
        entityType: item.entityType,
        count: item._count,
      })),
      topUsers: userActivity.map(item => ({
        userId: item.userId,
        count: item._count,
      })),
    }
  }

  /**
   * Rollback a change (mark as rolled back and create reverse change)
   */
  async rollback(auditLogId: string, userId: string) {
    const auditLog = await this.prisma.auditLog.findUnique({
      where: {id: auditLogId},
    })

    if (!auditLog) {
      throw new Error('Audit log not found')
    }

    if (auditLog.rolledBack) {
      throw new Error('This change has already been rolled back')
    }

    // Mark the original log as rolled back
    await this.prisma.auditLog.update({
      where: {id: auditLogId},
      data: {rolledBack: true},
    })

    // Parse the changes to determine how to rollback
    const changes = auditLog.changes ? JSON.parse(auditLog.changes) : null

    if (!changes || !changes.before) {
      throw new Error('Cannot rollback: no previous state available')
    }

    // Create a new audit log for the rollback action
    await this.logChange({
      userId,
      action: 'ROLLBACK',
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      changes: {
        originalAction: auditLog.action,
        originalTimestamp: auditLog.timestamp,
        restoredState: changes.before,
      },
    })

    return {
      success: true,
      message: 'Change rolled back successfully',
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      restoredState: changes.before,
    }
  }
}
