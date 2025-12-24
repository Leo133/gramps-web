import {Injectable, NotFoundException, BadRequestException} from '@nestjs/common'
import {PrismaService} from '../../prisma/prisma.service'
import {CreateExportDto} from '../dto/publishing.dto'

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new export job
   */
  async createExport(userId: string, dto: CreateExportDto) {
    // Validate export type
    const validTypes = ['pdf-book', 'pdf-report', 'photo-book', 'calendar']
    if (!validTypes.includes(dto.type)) {
      throw new BadRequestException(`Invalid export type: ${dto.type}`)
    }

    // Validate format
    const validFormats = ['ahnentafel', 'descendant', 'narrative', 'custom']
    if (!validFormats.includes(dto.format)) {
      throw new BadRequestException(`Invalid format: ${dto.format}`)
    }

    // Create export job
    const job = await this.prisma.exportJob.create({
      data: {
        userId,
        type: dto.type,
        format: dto.format,
        settings: JSON.stringify(dto.settings),
        status: 'pending',
      },
    })

    // In a real implementation, this would queue the job for async processing
    // For now, we'll simulate processing
    this.processExportJob(job.id)

    return this.formatExportResponse(job)
  }

  /**
   * Get all export jobs for a user
   */
  async getUserExports(userId: string) {
    const jobs = await this.prisma.exportJob.findMany({
      where: {userId},
      orderBy: {createdAt: 'desc'},
      take: 50, // Limit to last 50 exports
    })

    return jobs.map(job => this.formatExportResponse(job))
  }

  /**
   * Get a specific export job
   */
  async getExport(userId: string, exportId: string) {
    const job = await this.prisma.exportJob.findFirst({
      where: {id: exportId, userId},
    })

    if (!job) {
      throw new NotFoundException('Export not found')
    }

    return this.formatExportResponse(job)
  }

  /**
   * Get export download
   */
  async downloadExport(userId: string, exportId: string) {
    const job = await this.prisma.exportJob.findFirst({
      where: {id: exportId, userId},
    })

    if (!job) {
      throw new NotFoundException('Export not found')
    }

    if (job.status !== 'completed') {
      throw new BadRequestException('Export is not ready for download')
    }

    if (!job.filePath) {
      throw new BadRequestException('Export file not found')
    }

    // In a real implementation, this would return the actual file
    // For mock purposes, return the file info
    return {
      filePath: job.filePath,
      fileSize: job.fileSize,
      mimeType: this.getMimeType(job.type),
      filename: this.getFilename(job),
    }
  }

  /**
   * Delete an export job
   */
  async deleteExport(userId: string, exportId: string) {
    const job = await this.prisma.exportJob.findFirst({
      where: {id: exportId, userId},
    })

    if (!job) {
      throw new NotFoundException('Export not found')
    }

    // In a real implementation, this would also delete the file
    await this.prisma.exportJob.delete({
      where: {id: exportId},
    })

    return {success: true, message: 'Export deleted'}
  }

  /**
   * Process export job (mock implementation)
   */
  private async processExportJob(jobId: string) {
    try {
      // Update status to processing
      await this.prisma.exportJob.update({
        where: {id: jobId},
        data: {
          status: 'processing',
          startedAt: new Date(),
        },
      })

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate mock file path
      const job = await this.prisma.exportJob.findUnique({where: {id: jobId}})
      if (!job) return

      const filename = this.getFilename(job)
      const filePath = `/exports/${filename}`

      // Update status to completed
      await this.prisma.exportJob.update({
        where: {id: jobId},
        data: {
          status: 'completed',
          filePath,
          fileSize: Math.floor(Math.random() * 5000000) + 500000, // 0.5-5MB
          completedAt: new Date(),
        },
      })
    } catch (error) {
      // Update status to failed
      await this.prisma.exportJob.update({
        where: {id: jobId},
        data: {
          status: 'failed',
          errorMessage: error.message || 'Export processing failed',
          completedAt: new Date(),
        },
      })
    }
  }

  /**
   * Get MIME type for export type
   */
  private getMimeType(type: string): string {
    switch (type) {
      case 'pdf-book':
      case 'pdf-report':
        return 'application/pdf'
      case 'photo-book':
        return 'application/pdf'
      case 'calendar':
        return 'text/calendar'
      default:
        return 'application/octet-stream'
    }
  }

  /**
   * Generate filename for export
   */
  private getFilename(job: any): string {
    const settings = job.settings ? JSON.parse(job.settings) : {}
    const timestamp = new Date().toISOString().split('T')[0]

    switch (job.type) {
      case 'pdf-book':
        return `family-book-${job.format}-${timestamp}.pdf`
      case 'pdf-report':
        return `report-${job.format}-${timestamp}.pdf`
      case 'photo-book':
        return `photo-book-${timestamp}.pdf`
      case 'calendar':
        return `family-calendar-${timestamp}.ics`
      default:
        return `export-${timestamp}`
    }
  }

  /**
   * Format export response
   */
  private formatExportResponse(job: any) {
    return {
      id: job.id,
      type: job.type,
      format: job.format,
      settings: job.settings ? JSON.parse(job.settings) : null,
      status: job.status,
      filePath: job.filePath,
      fileSize: job.fileSize,
      errorMessage: job.errorMessage,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      createdAt: job.createdAt,
    }
  }

  /**
   * Get available export formats
   */
  getExportFormats() {
    return {
      types: [
        {
          id: 'pdf-book',
          name: 'Family Book (PDF)',
          description: 'Printable family history book with photos and narratives',
          formats: ['narrative', 'ahnentafel', 'descendant'],
        },
        {
          id: 'pdf-report',
          name: 'Report (PDF)',
          description: 'Standard genealogy reports',
          formats: ['ahnentafel', 'descendant', 'custom'],
        },
        {
          id: 'photo-book',
          name: 'Photo Book (PDF)',
          description: 'Photo album with captions and dates',
          formats: ['custom'],
        },
        {
          id: 'calendar',
          name: 'Calendar (iCal)',
          description: 'Birthdays and anniversaries for calendar apps',
          formats: ['custom'],
        },
      ],
      formats: [
        {
          id: 'ahnentafel',
          name: 'Ahnentafel',
          description: 'Ancestor chart with numbering system',
        },
        {
          id: 'descendant',
          name: 'Descendant Report',
          description: 'List of all descendants from a person',
        },
        {
          id: 'narrative',
          name: 'Narrative',
          description: 'Story-form biography of the family',
        },
        {
          id: 'custom',
          name: 'Custom',
          description: 'Customizable layout and content',
        },
      ],
      pageSizes: [
        {id: 'letter', name: 'US Letter (8.5" x 11")'},
        {id: 'a4', name: 'A4 (210mm x 297mm)'},
        {id: 'legal', name: 'US Legal (8.5" x 14")'},
      ],
    }
  }
}
