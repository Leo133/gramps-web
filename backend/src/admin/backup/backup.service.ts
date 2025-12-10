import {Injectable} from '@nestjs/common'
import {PrismaService} from '../../prisma/prisma.service'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as crypto from 'crypto'
import {exec} from 'child_process'
import {promisify} from 'util'

const execAsync = promisify(exec)

@Injectable()
export class BackupService {
  private readonly backupDir = process.env.BACKUP_DIR || './backups'
  private readonly encryptionKey = process.env.BACKUP_ENCRYPTION_KEY

  constructor(private prisma: PrismaService) {}

  /**
   * Create a backup
   */
  async createBackup(params: {
    type: 'manual' | 'scheduled'
    destination?: 'local' | 's3' | 'google-drive'
    encrypted?: boolean
    compression?: 'gzip' | 'zip' | 'none'
    createdBy?: string
  }) {
    const {
      type,
      destination = 'local',
      encrypted = false,
      compression = 'gzip',
      createdBy,
    } = params

    // Create backup job
    const job = await this.prisma.backupJob.create({
      data: {
        status: 'running',
        type,
        destination,
        encrypted,
        compression,
        createdBy,
        startedAt: new Date(),
      },
    })

    try {
      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, {recursive: true})

      // Generate backup filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `gramps-backup-${timestamp}`
      const backupPath = path.join(this.backupDir, filename)

      // Get database path from environment
      const dbPath =
        process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db'

      // Copy database file
      let finalPath = backupPath + '.db'
      await fs.copyFile(dbPath, finalPath)

      // Apply compression if requested
      if (compression === 'gzip') {
        await execAsync(`gzip -f "${finalPath}"`)
        finalPath += '.gz'
      } else if (compression === 'zip') {
        await execAsync(`zip -j "${finalPath}.zip" "${finalPath}"`)
        await fs.unlink(finalPath)
        finalPath += '.zip'
      }

      // Apply encryption if requested
      if (encrypted && this.encryptionKey) {
        const encryptedPath = finalPath + '.enc'
        await this.encryptFile(finalPath, encryptedPath)
        await fs.unlink(finalPath)
        finalPath = encryptedPath
      }

      // Get file size
      const stats = await fs.stat(finalPath)

      // Upload to cloud storage if destination is not local
      if (destination === 's3') {
        await this.uploadToS3(finalPath)
      } else if (destination === 'google-drive') {
        await this.uploadToGoogleDrive(finalPath)
      }

      // Update job status
      await this.prisma.backupJob.update({
        where: {id: job.id},
        data: {
          status: 'completed',
          filePath: finalPath,
          fileSize: stats.size,
          completedAt: new Date(),
        },
      })

      return {
        id: job.id,
        status: 'completed',
        filePath: finalPath,
        fileSize: stats.size,
      }
    } catch (error) {
      // Update job with error
      await this.prisma.backupJob.update({
        where: {id: job.id},
        data: {
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        },
      })

      throw error
    }
  }

  /**
   * Get all backup jobs
   */
  async findAll(params?: {
    status?: string
    type?: string
    page?: number
    perPage?: number
  }) {
    const {status, type, page = 1, perPage = 50} = params || {}

    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    const [total, jobs] = await Promise.all([
      this.prisma.backupJob.count({where}),
      this.prisma.backupJob.findMany({
        where,
        orderBy: {startedAt: 'desc'},
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ])

    return {
      data: jobs,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  /**
   * Get a specific backup job
   */
  async findOne(id: string) {
    return this.prisma.backupJob.findUnique({
      where: {id},
    })
  }

  /**
   * Delete old backups based on retention policy
   */
  async cleanupOldBackups(retentionDays: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    const oldBackups = await this.prisma.backupJob.findMany({
      where: {
        status: 'completed',
        completedAt: {
          lt: cutoffDate,
        },
      },
    })

    for (const backup of oldBackups) {
      if (backup.filePath) {
        try {
          await fs.unlink(backup.filePath)
        } catch (error) {
          console.error(
            `Failed to delete backup file: ${backup.filePath}`,
            error,
          )
        }
      }

      await this.prisma.backupJob.delete({
        where: {id: backup.id},
      })
    }

    return {
      deleted: oldBackups.length,
      cutoffDate,
    }
  }

  /**
   * Restore from backup
   */
  async restore(backupId: string) {
    const backup = await this.findOne(backupId)

    if (!backup || backup.status !== 'completed') {
      throw new Error('Backup not found or not completed')
    }

    if (!backup.filePath) {
      throw new Error('Backup file path not found')
    }

    // This is a placeholder - actual restore would require stopping the server
    // and replacing the database file
    return {
      message: 'Restore initiated. Server restart required.',
      backupId,
      filePath: backup.filePath,
    }
  }

  /**
   * Encrypt a file using AES-256-CBC
   */
  private async encryptFile(inputPath: string, outputPath: string) {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not configured')
    }

    const data = await fs.readFile(inputPath)
    const iv = crypto.randomBytes(16)
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32)
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)

    const encrypted = Buffer.concat([cipher.update(data), cipher.final()])
    const result = Buffer.concat([iv, encrypted])

    await fs.writeFile(outputPath, result)
  }

  /**
   * Upload to S3 (placeholder)
   */
  private async uploadToS3(filePath: string) {
    // Placeholder for S3 upload implementation
    // Would use AWS SDK here
    console.log(`Would upload ${filePath} to S3`)
  }

  /**
   * Upload to Google Drive (placeholder)
   */
  private async uploadToGoogleDrive(filePath: string) {
    // Placeholder for Google Drive upload implementation
    // Would use Google Drive API here
    console.log(`Would upload ${filePath} to Google Drive`)
  }
}
