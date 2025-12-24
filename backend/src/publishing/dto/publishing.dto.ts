import {
  IsString,
  IsOptional,
  IsObject,
  IsBoolean,
  IsNumber,
  IsArray,
  IsDateString,
  MinLength,
  MaxLength,
  Matches,
  Min,
  Max,
} from 'class-validator'
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger'

// ========== Site DTOs ==========

export class SiteSettingsDto {
  @ApiPropertyOptional({description: 'Handle of the home/root person'})
  @IsOptional()
  @IsString()
  homePerson?: string

  @ApiPropertyOptional({description: 'List of branch handles to include'})
  @IsOptional()
  @IsArray()
  includedBranches?: string[]

  @ApiPropertyOptional({description: 'Include photos in the site'})
  @IsOptional()
  @IsBoolean()
  showPhotos?: boolean

  @ApiPropertyOptional({description: 'Include timelines in the site'})
  @IsOptional()
  @IsBoolean()
  showTimelines?: boolean

  @ApiPropertyOptional({description: 'Include maps in the site'})
  @IsOptional()
  @IsBoolean()
  showMaps?: boolean

  @ApiPropertyOptional({description: 'Header image path'})
  @IsOptional()
  @IsString()
  headerImage?: string

  @ApiPropertyOptional({description: 'Footer text'})
  @IsOptional()
  @IsString()
  footerText?: string
}

export class CreateSiteDto {
  @ApiProperty({description: 'Site name'})
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string

  @ApiProperty({description: 'Subdomain for the site (alphanumeric and hyphens only)'})
  @IsString()
  @MinLength(3)
  @MaxLength(63)
  @Matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
    message: 'Subdomain must be lowercase alphanumeric with hyphens, cannot start or end with hyphen',
  })
  subdomain: string

  @ApiPropertyOptional({description: 'Custom domain for the site'})
  @IsOptional()
  @IsString()
  customDomain?: string

  @ApiPropertyOptional({description: 'Theme ID', default: 'classic'})
  @IsOptional()
  @IsString()
  theme?: string

  @ApiPropertyOptional({description: 'Site settings'})
  @IsOptional()
  @IsObject()
  settings?: SiteSettingsDto
}

export class UpdateSiteDto {
  @ApiPropertyOptional({description: 'Site name'})
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional({description: 'Custom domain for the site'})
  @IsOptional()
  @IsString()
  customDomain?: string

  @ApiPropertyOptional({description: 'Theme ID'})
  @IsOptional()
  @IsString()
  theme?: string

  @ApiPropertyOptional({description: 'Site settings'})
  @IsOptional()
  @IsObject()
  settings?: SiteSettingsDto

  @ApiPropertyOptional({description: 'Site status', enum: ['draft', 'published', 'archived']})
  @IsOptional()
  @IsString()
  status?: string
}

// ========== Share Link DTOs ==========

export class CreateShareLinkDto {
  @ApiProperty({description: 'Name/description for the share link'})
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string

  @ApiProperty({description: 'Entity type to share', enum: ['Person', 'Family', 'Branch']})
  @IsString()
  entityType: string

  @ApiProperty({description: 'Entity handle to share'})
  @IsString()
  entityId: string

  @ApiPropertyOptional({description: 'Privacy level', enum: ['all', 'living', 'deceased', 'public'], default: 'public'})
  @IsOptional()
  @IsString()
  privacyLevel?: string

  @ApiPropertyOptional({description: 'Maximum generations to include'})
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  maxGenerations?: number

  @ApiPropertyOptional({description: 'Expiration date'})
  @IsOptional()
  @IsDateString()
  expiresAt?: string

  @ApiPropertyOptional({description: 'Optional password protection'})
  @IsOptional()
  @IsString()
  @MinLength(4)
  password?: string

  @ApiPropertyOptional({description: 'Maximum number of views allowed'})
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxViews?: number
}

export class AccessShareDto {
  @ApiPropertyOptional({description: 'Password if required'})
  @IsOptional()
  @IsString()
  password?: string
}

// ========== Export DTOs ==========

export class ExportSettingsDto {
  @ApiPropertyOptional({description: 'Root person handle'})
  @IsOptional()
  @IsString()
  rootPerson?: string

  @ApiPropertyOptional({description: 'Number of generations'})
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  generations?: number

  @ApiPropertyOptional({description: 'Direction', enum: ['ancestors', 'descendants', 'both']})
  @IsOptional()
  @IsString()
  direction?: string

  @ApiPropertyOptional({description: 'Include photos'})
  @IsOptional()
  @IsBoolean()
  includePhotos?: boolean

  @ApiPropertyOptional({description: 'Include timelines'})
  @IsOptional()
  @IsBoolean()
  includeTimelines?: boolean

  @ApiPropertyOptional({description: 'Include maps'})
  @IsOptional()
  @IsBoolean()
  includeMaps?: boolean

  @ApiPropertyOptional({description: 'Page size', enum: ['letter', 'a4', 'legal']})
  @IsOptional()
  @IsString()
  pageSize?: string

  @ApiPropertyOptional({description: 'Orientation', enum: ['portrait', 'landscape']})
  @IsOptional()
  @IsString()
  orientation?: string
}

export class CreateExportDto {
  @ApiProperty({description: 'Export type', enum: ['pdf-book', 'pdf-report', 'photo-book', 'calendar']})
  @IsString()
  type: string

  @ApiProperty({description: 'Format', enum: ['ahnentafel', 'descendant', 'narrative', 'custom']})
  @IsString()
  format: string

  @ApiProperty({description: 'Export settings'})
  @IsObject()
  settings: ExportSettingsDto
}

// ========== Embed DTOs ==========

export class EmbedOptionsDto {
  @ApiPropertyOptional({description: 'Number of generations'})
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  generations?: number

  @ApiPropertyOptional({description: 'Direction', enum: ['ancestors', 'descendants', 'both']})
  @IsOptional()
  @IsString()
  direction?: string

  @ApiPropertyOptional({description: 'Widget width'})
  @IsOptional()
  @IsString()
  width?: string

  @ApiPropertyOptional({description: 'Widget height'})
  @IsOptional()
  @IsString()
  height?: string

  @ApiPropertyOptional({description: 'Theme', enum: ['light', 'dark', 'auto']})
  @IsOptional()
  @IsString()
  theme?: string
}

export class CreateEmbedDto {
  @ApiProperty({description: 'Widget type', enum: ['tree', 'pedigree', 'fan', 'timeline', 'photos', 'map']})
  @IsString()
  type: string

  @ApiProperty({description: 'Entity handle'})
  @IsString()
  entityId: string

  @ApiPropertyOptional({description: 'Embed options'})
  @IsOptional()
  @IsObject()
  options?: EmbedOptionsDto
}

// ========== API Key DTOs ==========

export class CreateApiKeyDto {
  @ApiProperty({description: 'API key name'})
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string

  @ApiProperty({description: 'Permissions array'})
  @IsArray()
  @IsString({each: true})
  permissions: string[]

  @ApiPropertyOptional({description: 'Rate limit (requests per hour)', default: 1000})
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(100000)
  rateLimit?: number

  @ApiPropertyOptional({description: 'Expiration date'})
  @IsOptional()
  @IsDateString()
  expiresAt?: string
}

// ========== Webhook DTOs ==========

export class CreateWebhookDto {
  @ApiProperty({description: 'Webhook name'})
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string

  @ApiProperty({description: 'Webhook URL (HTTPS required)'})
  @IsString()
  @Matches(/^https:\/\//, {message: 'Webhook URL must use HTTPS'})
  url: string

  @ApiProperty({description: 'Event types to subscribe to'})
  @IsArray()
  @IsString({each: true})
  events: string[]
}

// ========== Calendar Export DTOs ==========

export class CalendarExportDto {
  @ApiPropertyOptional({description: 'Export format', enum: ['ical', 'csv'], default: 'ical'})
  @IsOptional()
  @IsString()
  format?: string

  @ApiPropertyOptional({description: 'Scope of events', default: 'birthdays,anniversaries'})
  @IsOptional()
  @IsString()
  scope?: string
}
