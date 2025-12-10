import {Module} from '@nestjs/common'
import {PrismaModule} from '../prisma/prisma.module'
import {AdminController} from './admin.controller'
import {AuditService} from './audit/audit.service'
import {BackupService} from './backup/backup.service'
import {BulkService} from './bulk/bulk.service'
import {HealthService} from './health/health.service'
import {WorkflowService} from './workflow/workflow.service'

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [
    AuditService,
    BackupService,
    BulkService,
    HealthService,
    WorkflowService,
  ],
  exports: [
    AuditService,
    BackupService,
    BulkService,
    HealthService,
    WorkflowService,
  ],
})
export class AdminModule {}
