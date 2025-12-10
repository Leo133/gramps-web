import {Controller, Get, Post, Delete, Body, Param, Query} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import {Roles} from '../auth/decorators/auth.decorator'
import {CurrentUser} from '../auth/decorators/current-user.decorator'
import {AuditService} from './audit/audit.service'
import {BackupService} from './backup/backup.service'
import {BulkService} from './bulk/bulk.service'
import {HealthService} from './health/health.service'
import {WorkflowService} from './workflow/workflow.service'
import {
  AuditLogQueryDto,
  RollbackDto,
  CreateBackupDto,
  BackupQueryDto,
  CleanupBackupsDto,
  MassTagDto,
  FindReplaceDto,
  MergeDuplicatesDto,
  FindDuplicatesDto,
  HealthMetricsQueryDto,
  CleanupMetricsDto,
  SubmitProposalDto,
  ProposalQueryDto,
  ReviewProposalDto,
} from './dto/admin.dto'

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('api/admin')
export class AdminController {
  constructor(
    private readonly auditService: AuditService,
    private readonly backupService: BackupService,
    private readonly bulkService: BulkService,
    private readonly healthService: HealthService,
    private readonly workflowService: WorkflowService,
  ) {}

  // Audit Log Endpoints
  @Get('audit-logs')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Get audit logs with optional filters'})
  @ApiResponse({status: 200, description: 'List of audit logs'})
  async getAuditLogs(@Query() query: AuditLogQueryDto) {
    return this.auditService.findAll({
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    })
  }

  @Get('audit-logs/entity/:entityType/:entityId')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Get audit logs for a specific entity'})
  @ApiResponse({status: 200, description: 'Audit logs for entity'})
  async getEntityAuditLogs(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.findByEntity(entityType, entityId)
  }

  @Get('audit-logs/statistics')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Get audit log statistics'})
  @ApiResponse({status: 200, description: 'Audit log statistics'})
  async getAuditStatistics(@Query() query: AuditLogQueryDto) {
    return this.auditService.getStatistics(
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
    )
  }

  @Post('audit-logs/rollback')
  @Roles('owner')
  @ApiOperation({summary: 'Rollback a change (Owner only)'})
  @ApiResponse({status: 200, description: 'Change rolled back successfully'})
  async rollbackChange(@Body() dto: RollbackDto, @CurrentUser() user: any) {
    return this.auditService.rollback(dto.auditLogId, user.id)
  }

  // Backup Endpoints
  @Post('backups')
  @Roles('owner')
  @ApiOperation({summary: 'Create a backup (Owner only)'})
  @ApiResponse({status: 201, description: 'Backup created successfully'})
  async createBackup(@Body() dto: CreateBackupDto, @CurrentUser() user: any) {
    return this.backupService.createBackup({
      type: dto.type || 'manual',
      destination: dto.destination,
      encrypted: dto.encrypted,
      compression: dto.compression,
      createdBy: user.id,
    })
  }

  @Get('backups')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Get all backups'})
  @ApiResponse({status: 200, description: 'List of backups'})
  async getBackups(@Query() query: BackupQueryDto) {
    return this.backupService.findAll(query)
  }

  @Get('backups/:id')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Get backup details'})
  @ApiResponse({status: 200, description: 'Backup details'})
  async getBackup(@Param('id') id: string) {
    return this.backupService.findOne(id)
  }

  @Post('backups/:id/restore')
  @Roles('owner')
  @ApiOperation({summary: 'Restore from backup (Owner only)'})
  @ApiResponse({status: 200, description: 'Restore initiated'})
  async restoreBackup(@Param('id') id: string) {
    return this.backupService.restore(id)
  }

  @Delete('backups/cleanup')
  @Roles('owner')
  @ApiOperation({summary: 'Clean up old backups (Owner only)'})
  @ApiResponse({status: 200, description: 'Old backups deleted'})
  async cleanupBackups(@Body() dto: CleanupBackupsDto) {
    return this.backupService.cleanupOldBackups(dto.retentionDays)
  }

  // Bulk Operations Endpoints
  @Post('bulk/mass-tag')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Mass tag entities'})
  @ApiResponse({status: 200, description: 'Entities tagged successfully'})
  async massTag(@Body() dto: MassTagDto, @CurrentUser() user: any) {
    return this.bulkService.massTag({
      ...dto,
      userId: user.id,
    })
  }

  @Post('bulk/find-replace')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Find and replace text in entities'})
  @ApiResponse({status: 200, description: 'Find and replace completed'})
  async findReplace(@Body() dto: FindReplaceDto, @CurrentUser() user: any) {
    return this.bulkService.findAndReplace({
      ...dto,
      userId: user.id,
    })
  }

  @Post('bulk/merge')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Merge duplicate entities'})
  @ApiResponse({status: 200, description: 'Entities merged successfully'})
  async mergeDuplicates(
    @Body() dto: MergeDuplicatesDto,
    @CurrentUser() user: any,
  ) {
    return this.bulkService.mergeDuplicates({
      ...dto,
      userId: user.id,
    })
  }

  @Get('bulk/find-duplicates')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Find potential duplicate entities'})
  @ApiResponse({status: 200, description: 'List of potential duplicates'})
  async findDuplicates(@Query() query: FindDuplicatesDto) {
    return this.bulkService.findDuplicates(query)
  }

  // System Health Endpoints
  @Get('health/current')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Get current system health metrics'})
  @ApiResponse({status: 200, description: 'Current health metrics'})
  async getCurrentHealth() {
    return this.healthService.getCurrentMetrics()
  }

  @Get('health/status')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Get system status summary'})
  @ApiResponse({status: 200, description: 'System status summary'})
  async getSystemStatus() {
    return this.healthService.getSystemStatus()
  }

  @Get('health/metrics')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Get historical health metrics'})
  @ApiResponse({status: 200, description: 'Historical metrics'})
  async getHealthMetrics(@Query() query: HealthMetricsQueryDto) {
    return this.healthService.getMetricsHistory({
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    })
  }

  @Get('health/database')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Get database statistics'})
  @ApiResponse({status: 200, description: 'Database statistics'})
  async getDatabaseStats() {
    return this.healthService.getDatabaseStats()
  }

  @Delete('health/metrics/cleanup')
  @Roles('owner')
  @ApiOperation({summary: 'Clean up old health metrics (Owner only)'})
  @ApiResponse({status: 200, description: 'Old metrics deleted'})
  async cleanupMetrics(@Body() dto: CleanupMetricsDto) {
    return this.healthService.cleanupOldMetrics(dto.retentionDays)
  }

  // Approval Workflow Endpoints
  @Post('proposals')
  @Roles('contributor', 'member')
  @ApiOperation({summary: 'Submit a change proposal'})
  @ApiResponse({status: 201, description: 'Proposal submitted successfully'})
  async submitProposal(
    @Body() dto: SubmitProposalDto,
    @CurrentUser() user: any,
  ) {
    return this.workflowService.submitProposal({
      ...dto,
      submitterId: user.id,
    })
  }

  @Get('proposals')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Get all proposals'})
  @ApiResponse({status: 200, description: 'List of proposals'})
  async getProposals(@Query() query: ProposalQueryDto) {
    return this.workflowService.findAll(query)
  }

  @Get('proposals/:id')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Get proposal details'})
  @ApiResponse({status: 200, description: 'Proposal details'})
  async getProposal(@Param('id') id: string) {
    return this.workflowService.findOne(id)
  }

  @Post('proposals/:id/approve')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Approve a proposal'})
  @ApiResponse({status: 200, description: 'Proposal approved'})
  async approveProposal(
    @Param('id') id: string,
    @Body() dto: ReviewProposalDto,
    @CurrentUser() user: any,
  ) {
    return this.workflowService.approve({
      proposalId: id,
      reviewerId: user.id,
      comment: dto.comment,
    })
  }

  @Post('proposals/:id/reject')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Reject a proposal'})
  @ApiResponse({status: 200, description: 'Proposal rejected'})
  async rejectProposal(
    @Param('id') id: string,
    @Body() dto: ReviewProposalDto,
    @CurrentUser() user: any,
  ) {
    if (!dto.comment) {
      throw new Error('Comment is required when rejecting a proposal')
    }
    return this.workflowService.reject({
      proposalId: id,
      reviewerId: user.id,
      comment: dto.comment,
    })
  }

  @Get('proposals/statistics')
  @Roles('editor', 'owner')
  @ApiOperation({summary: 'Get proposal statistics'})
  @ApiResponse({status: 200, description: 'Proposal statistics'})
  async getProposalStatistics() {
    return this.workflowService.getStatistics()
  }
}
