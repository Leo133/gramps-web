import {Injectable} from '@nestjs/common'
import {PrismaService} from '../../prisma/prisma.service'
import * as os from 'os'
import * as fs from 'fs/promises'

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get current system health metrics
   */
  async getCurrentMetrics() {
    const metrics = {
      timestamp: new Date(),
      cpuUsage: this.getCpuUsage(),
      memoryUsage: this.getMemoryUsage(),
      diskUsage: await this.getDiskUsage(),
      dbSize: await this.getDatabaseSize(),
      dbConnections: await this.getActiveConnections(),
      requestCount: await this.getRecentRequestCount(),
      errorCount: await this.getRecentErrorCount(),
      activeUsers: await this.getActiveUsers(),
    }

    // Store metrics in database
    await this.prisma.systemHealth.create({
      data: {
        ...metrics,
        cpuUsage: Number(metrics.cpuUsage.toFixed(2)),
        memoryUsage: Number(metrics.memoryUsage.toFixed(2)),
        diskUsage: Number(metrics.diskUsage.toFixed(2)),
      },
    })

    return metrics
  }

  /**
   * Get historical metrics
   */
  async getMetricsHistory(params?: {
    startDate?: Date
    endDate?: Date
    interval?: 'hour' | 'day' | 'week'
    page?: number
    perPage?: number
  }) {
    const {
      startDate,
      endDate,
      interval = 'hour',
      page = 1,
      perPage = 100,
    } = params || {}

    const where: any = {}
    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) where.timestamp.gte = startDate
      if (endDate) where.timestamp.lte = endDate
    }

    const [total, metrics] = await Promise.all([
      this.prisma.systemHealth.count({where}),
      this.prisma.systemHealth.findMany({
        where,
        orderBy: {timestamp: 'desc'},
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ])

    // Calculate aggregates based on interval
    const aggregated = this.aggregateMetrics(metrics, interval)

    return {
      data: aggregated,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  /**
   * Get system status summary
   */
  async getSystemStatus() {
    const current = await this.getCurrentMetrics()

    // Get metrics from the last hour for trending
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentMetrics = await this.prisma.systemHealth.findMany({
      where: {
        timestamp: {gte: oneHourAgo},
      },
      orderBy: {timestamp: 'desc'},
    })

    // Calculate trends
    const trends = this.calculateTrends(recentMetrics)

    // Determine overall health status
    const status = this.determineHealthStatus(current, trends)

    return {
      status,
      current,
      trends,
      timestamp: new Date(),
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    const [
      userCount,
      personCount,
      familyCount,
      eventCount,
      placeCount,
      mediaCount,
      sourceCount,
      noteCount,
      auditLogCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.person.count(),
      this.prisma.family.count(),
      this.prisma.event.count(),
      this.prisma.place.count(),
      this.prisma.media.count(),
      this.prisma.source.count(),
      this.prisma.note.count(),
      this.prisma.auditLog.count(),
    ])

    const dbSize = await this.getDatabaseSize()

    return {
      counts: {
        users: userCount,
        people: personCount,
        families: familyCount,
        events: eventCount,
        places: placeCount,
        media: mediaCount,
        sources: sourceCount,
        notes: noteCount,
        auditLogs: auditLogCount,
      },
      totalRecords: userCount + personCount + familyCount + eventCount + 
                     placeCount + mediaCount + sourceCount + noteCount,
      databaseSize: dbSize,
    }
  }

  /**
   * Clean up old health metrics
   */
  async cleanupOldMetrics(retentionDays: number = 90) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    const deleted = await this.prisma.systemHealth.deleteMany({
      where: {
        timestamp: {lt: cutoffDate},
      },
    })

    return {
      deleted: deleted.count,
      cutoffDate,
    }
  }

  /**
   * Helper: Get CPU usage
   */
  private getCpuUsage(): number {
    const cpus = os.cpus()
    let totalIdle = 0
    let totalTick = 0

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times]
      }
      totalIdle += cpu.times.idle
    })

    const idle = totalIdle / cpus.length
    const total = totalTick / cpus.length
    const usage = 100 - ~~(100 * idle / total)

    return usage
  }

  /**
   * Helper: Get memory usage
   */
  private getMemoryUsage(): number {
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const usage = (usedMem / totalMem) * 100

    return usage
  }

  /**
   * Helper: Get disk usage
   */
  private async getDiskUsage(): Promise<number> {
    // This is a simplified version
    // In production, you'd want to check the actual filesystem
    try {
      const stats = await fs.statfs('/')
      const total = stats.blocks * stats.bsize
      const free = stats.bfree * stats.bsize
      const used = total - free
      return (used / total) * 100
    } catch (error) {
      // Fallback if statfs is not available
      return 0
    }
  }

  /**
   * Helper: Get database size
   */
  private async getDatabaseSize(): Promise<number> {
    try {
      const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db'
      const stats = await fs.stat(dbPath)
      return stats.size
    } catch (error) {
      return 0
    }
  }

  /**
   * Helper: Get active database connections
   */
  private async getActiveConnections(): Promise<number> {
    // For SQLite, this is typically 1
    // For PostgreSQL, you'd query pg_stat_activity
    return 1
  }

  /**
   * Helper: Get recent request count
   */
  private async getRecentRequestCount(): Promise<number> {
    // This would typically be tracked by middleware
    // For now, we'll estimate based on audit logs
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return this.prisma.auditLog.count({
      where: {
        timestamp: {gte: oneHourAgo},
      },
    })
  }

  /**
   * Helper: Get recent error count
   */
  private async getRecentErrorCount(): Promise<number> {
    // This would typically be tracked by error monitoring
    // For now, return 0 as placeholder
    return 0
  }

  /**
   * Helper: Get active users
   */
  private async getActiveUsers(): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    const activeUserIds = await this.prisma.auditLog.findMany({
      where: {
        timestamp: {gte: oneHourAgo},
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    })

    return activeUserIds.length
  }

  /**
   * Helper: Aggregate metrics by interval
   */
  private aggregateMetrics(metrics: any[], interval: string) {
    if (interval === 'hour') {
      return metrics // Return raw data for hourly
    }

    // Group by day or week
    const grouped = new Map<string, any[]>()

    metrics.forEach(metric => {
      const date = new Date(metric.timestamp)
      let key: string

      if (interval === 'day') {
        key = date.toISOString().split('T')[0]
      } else {
        // week
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
      }

      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(metric)
    })

    // Calculate averages for each group
    const aggregated: any[] = []
    grouped.forEach((group, key) => {
      const avg = {
        timestamp: new Date(key),
        cpuUsage: this.average(group.map(m => m.cpuUsage)),
        memoryUsage: this.average(group.map(m => m.memoryUsage)),
        diskUsage: this.average(group.map(m => m.diskUsage)),
        dbSize: Math.max(...group.map(m => m.dbSize || 0)),
        dbConnections: this.average(group.map(m => m.dbConnections)),
        requestCount: group.reduce((sum, m) => sum + (m.requestCount || 0), 0),
        errorCount: group.reduce((sum, m) => sum + (m.errorCount || 0), 0),
        activeUsers: Math.max(...group.map(m => m.activeUsers || 0)),
      }
      aggregated.push(avg)
    })

    return aggregated.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Helper: Calculate average
   */
  private average(values: number[]): number {
    const filtered = values.filter(v => v != null && !isNaN(v))
    if (filtered.length === 0) return 0
    return filtered.reduce((sum, v) => sum + v, 0) / filtered.length
  }

  /**
   * Helper: Calculate trends
   */
  private calculateTrends(metrics: any[]) {
    if (metrics.length < 2) {
      return {
        cpuTrend: 'stable',
        memoryTrend: 'stable',
        diskTrend: 'stable',
        requestTrend: 'stable',
        errorTrend: 'stable',
      }
    }

    const recent = metrics.slice(0, Math.floor(metrics.length / 2))
    const older = metrics.slice(Math.floor(metrics.length / 2))

    return {
      cpuTrend: this.calculateTrend(
        this.average(older.map(m => m.cpuUsage)),
        this.average(recent.map(m => m.cpuUsage))
      ),
      memoryTrend: this.calculateTrend(
        this.average(older.map(m => m.memoryUsage)),
        this.average(recent.map(m => m.memoryUsage))
      ),
      diskTrend: this.calculateTrend(
        this.average(older.map(m => m.diskUsage)),
        this.average(recent.map(m => m.diskUsage))
      ),
      requestTrend: this.calculateTrend(
        this.average(older.map(m => m.requestCount)),
        this.average(recent.map(m => m.requestCount))
      ),
      errorTrend: this.calculateTrend(
        this.average(older.map(m => m.errorCount)),
        this.average(recent.map(m => m.errorCount))
      ),
    }
  }

  /**
   * Helper: Calculate single trend
   */
  private calculateTrend(oldValue: number, newValue: number): string {
    const change = ((newValue - oldValue) / oldValue) * 100

    if (Math.abs(change) < 5) return 'stable'
    if (change > 0) return 'increasing'
    return 'decreasing'
  }

  /**
   * Helper: Determine overall health status
   */
  private determineHealthStatus(current: any, trends: any): string {
    const warnings: string[] = []

    if (current.cpuUsage > 80) warnings.push('High CPU usage')
    if (current.memoryUsage > 85) warnings.push('High memory usage')
    if (current.diskUsage > 90) warnings.push('High disk usage')
    if (current.errorCount > 10) warnings.push('High error rate')

    if (warnings.length === 0) return 'healthy'
    if (warnings.length <= 2) return 'warning'
    return 'critical'
  }
}
