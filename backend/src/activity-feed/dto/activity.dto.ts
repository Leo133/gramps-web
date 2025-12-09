import {IsString, IsOptional} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'

export class CreateActivityDto {
  @ApiProperty({description: 'Action performed (added, updated, deleted, commented, etc.)'})
  @IsString()
  action: string

  @ApiProperty({description: 'Type of entity (Person, Family, Media, etc.)'})
  @IsString()
  entityType: string

  @ApiProperty({description: 'Handle/ID of the entity'})
  @IsString()
  entityId: string

  @ApiProperty({required: false, description: 'Display name of the entity'})
  @IsString()
  @IsOptional()
  entityName?: string

  @ApiProperty({required: false, description: 'Additional details as JSON'})
  @IsString()
  @IsOptional()
  details?: string

  @ApiProperty({required: false, default: 'all', description: 'Visibility level (all, editors, owners)'})
  @IsString()
  @IsOptional()
  visibility?: string
}
