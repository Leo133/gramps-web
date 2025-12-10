import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsArray,
  IsBoolean,
  IsNumber,
} from 'class-validator'
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger'

// Audit DTOs
export class AuditLogQueryDto {
  @ApiPropertyOptional({description: 'Filter by user ID'})
  @IsOptional()
  @IsString()
  userId?: string

  @ApiPropertyOptional({description: 'Filter by entity type'})
  @IsOptional()
  @IsString()
  entityType?: string

  @ApiPropertyOptional({description: 'Filter by entity ID'})
  @IsOptional()
  @IsString()
  entityId?: string

  @ApiPropertyOptional({description: 'Filter by action'})
  @IsOptional()
  @IsEnum(['CREATE', 'UPDATE', 'DELETE', 'ROLLBACK'])
  action?: string

  @ApiPropertyOptional({description: 'Start date for filtering'})
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({description: 'End date for filtering'})
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiPropertyOptional({description: 'Page number', minimum: 1, default: 1})
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  perPage?: number
}

export class RollbackDto {
  @ApiProperty({description: 'ID of the audit log entry to rollback'})
  @IsString()
  auditLogId: string
}

// Backup DTOs
export class CreateBackupDto {
  @ApiPropertyOptional({
    description: 'Backup type',
    enum: ['manual', 'scheduled'],
    default: 'manual',
  })
  @IsOptional()
  @IsEnum(['manual', 'scheduled'])
  type?: 'manual' | 'scheduled'

  @ApiPropertyOptional({
    description: 'Destination',
    enum: ['local', 's3', 'google-drive'],
    default: 'local',
  })
  @IsOptional()
  @IsEnum(['local', 's3', 'google-drive'])
  destination?: 'local' | 's3' | 'google-drive'

  @ApiPropertyOptional({description: 'Enable encryption', default: false})
  @IsOptional()
  @IsBoolean()
  encrypted?: boolean

  @ApiPropertyOptional({
    description: 'Compression type',
    enum: ['gzip', 'zip', 'none'],
    default: 'gzip',
  })
  @IsOptional()
  @IsEnum(['gzip', 'zip', 'none'])
  compression?: 'gzip' | 'zip' | 'none'
}

export class BackupQueryDto {
  @ApiPropertyOptional({description: 'Filter by status'})
  @IsOptional()
  @IsEnum(['pending', 'running', 'completed', 'failed'])
  status?: string

  @ApiPropertyOptional({description: 'Filter by type'})
  @IsOptional()
  @IsEnum(['manual', 'scheduled'])
  type?: string

  @ApiPropertyOptional({description: 'Page number', minimum: 1, default: 1})
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  perPage?: number
}

export class CleanupBackupsDto {
  @ApiProperty({
    description: 'Retention period in days',
    minimum: 1,
    default: 30,
  })
  @IsInt()
  @Min(1)
  retentionDays: number
}

// Bulk Operations DTOs
export class MassTagDto {
  @ApiProperty({
    description: 'Entity type',
    enum: ['person', 'place', 'source', 'media'],
  })
  @IsEnum(['person', 'place', 'source', 'media'])
  entityType: 'person' | 'place' | 'source' | 'media'

  @ApiProperty({description: 'Array of entity IDs to tag', type: [String]})
  @IsArray()
  @IsString({each: true})
  entityIds: string[]

  @ApiProperty({description: 'Tags to apply', type: [String]})
  @IsArray()
  @IsString({each: true})
  tags: string[]
}

export class FindReplaceDto {
  @ApiProperty({
    description: 'Entity type',
    enum: ['person', 'place', 'source', 'note'],
  })
  @IsEnum(['person', 'place', 'source', 'note'])
  entityType: 'person' | 'place' | 'source' | 'note'

  @ApiProperty({description: 'Field to search in'})
  @IsString()
  field: string

  @ApiProperty({description: 'Text to find'})
  @IsString()
  findText: string

  @ApiProperty({description: 'Text to replace with'})
  @IsString()
  replaceText: string

  @ApiPropertyOptional({description: 'Case sensitive search', default: false})
  @IsOptional()
  @IsBoolean()
  caseSensitive?: boolean

  @ApiPropertyOptional({description: 'Match whole words only', default: false})
  @IsOptional()
  @IsBoolean()
  wholeWord?: boolean
}

export class MergeDuplicatesDto {
  @ApiProperty({
    description: 'Entity type',
    enum: ['person', 'place', 'source'],
  })
  @IsEnum(['person', 'place', 'source'])
  entityType: 'person' | 'place' | 'source'

  @ApiProperty({description: 'ID of the primary entity to keep'})
  @IsString()
  primaryId: string

  @ApiProperty({
    description: 'IDs of duplicate entities to merge',
    type: [String],
  })
  @IsArray()
  @IsString({each: true})
  duplicateIds: string[]

  @ApiPropertyOptional({
    description: 'Merge strategy',
    enum: ['prefer-primary', 'prefer-newest', 'prefer-oldest'],
    default: 'prefer-primary',
  })
  @IsOptional()
  @IsEnum(['prefer-primary', 'prefer-newest', 'prefer-oldest'])
  strategy?: 'prefer-primary' | 'prefer-newest' | 'prefer-oldest'
}

export class FindDuplicatesDto {
  @ApiProperty({
    description: 'Entity type',
    enum: ['person', 'place', 'source'],
  })
  @IsEnum(['person', 'place', 'source'])
  entityType: 'person' | 'place' | 'source'

  @ApiPropertyOptional({
    description: 'Similarity threshold (0-1)',
    minimum: 0,
    maximum: 1,
    default: 0.8,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  threshold?: number
}

// Health Monitoring DTOs
export class HealthMetricsQueryDto {
  @ApiPropertyOptional({description: 'Start date for filtering'})
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({description: 'End date for filtering'})
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiPropertyOptional({
    description: 'Aggregation interval',
    enum: ['hour', 'day', 'week'],
    default: 'hour',
  })
  @IsOptional()
  @IsEnum(['hour', 'day', 'week'])
  interval?: 'hour' | 'day' | 'week'

  @ApiPropertyOptional({description: 'Page number', minimum: 1, default: 1})
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  perPage?: number
}

export class CleanupMetricsDto {
  @ApiProperty({
    description: 'Retention period in days',
    minimum: 1,
    default: 90,
  })
  @IsInt()
  @Min(1)
  retentionDays: number
}

// Workflow DTOs
export class SubmitProposalDto {
  @ApiProperty({description: 'Entity type being proposed'})
  @IsString()
  entityType: string

  @ApiPropertyOptional({description: 'Entity ID (null for new entities)'})
  @IsOptional()
  @IsString()
  entityId?: string

  @ApiProperty({
    description: 'Operation type',
    enum: ['CREATE', 'UPDATE', 'DELETE'],
  })
  @IsEnum(['CREATE', 'UPDATE', 'DELETE'])
  operation: 'CREATE' | 'UPDATE' | 'DELETE'

  @ApiProperty({description: 'Proposed changes as JSON object'})
  proposedChanges: any

  @ApiPropertyOptional({
    description: 'Current state as JSON object (for updates)',
  })
  @IsOptional()
  currentState?: any
}

export class ProposalQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['pending', 'approved', 'rejected'],
  })
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected'])
  status?: 'pending' | 'approved' | 'rejected'

  @ApiPropertyOptional({description: 'Filter by submitter ID'})
  @IsOptional()
  @IsString()
  submitterId?: string

  @ApiPropertyOptional({description: 'Filter by reviewer ID'})
  @IsOptional()
  @IsString()
  reviewerId?: string

  @ApiPropertyOptional({description: 'Filter by entity type'})
  @IsOptional()
  @IsString()
  entityType?: string

  @ApiPropertyOptional({description: 'Page number', minimum: 1, default: 1})
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  perPage?: number
}

export class ReviewProposalDto {
  @ApiPropertyOptional({description: 'Review comment'})
  @IsOptional()
  @IsString()
  comment?: string
}
