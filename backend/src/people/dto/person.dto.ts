import {IsString, IsInt, IsBoolean, IsOptional} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'

export class CreatePersonDto {
  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  handle?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  grampsId?: string

  @ApiProperty({required: false, default: 2})
  @IsInt()
  @IsOptional()
  gender?: number

  @ApiProperty({required: false, default: false})
  @IsBoolean()
  @IsOptional()
  private?: boolean

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  firstName?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  surname?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  callName?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  birthDate?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  birthPlace?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  deathDate?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  deathPlace?: string

  @ApiProperty({required: false, description: 'JSON string for primary_name'})
  @IsString()
  @IsOptional()
  primaryName?: string

  @ApiProperty({required: false, description: 'JSON string for profile'})
  @IsString()
  @IsOptional()
  profile?: string

  @ApiProperty({required: false, description: 'JSON string for media_list'})
  @IsString()
  @IsOptional()
  mediaList?: string

  @ApiProperty({required: false, description: 'JSON string for event_ref_list'})
  @IsString()
  @IsOptional()
  eventRefList?: string
}

export class UpdatePersonDto {
  @ApiProperty({required: false})
  @IsInt()
  @IsOptional()
  gender?: number

  @ApiProperty({required: false})
  @IsBoolean()
  @IsOptional()
  private?: boolean

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  firstName?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  surname?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  callName?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  birthDate?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  birthPlace?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  deathDate?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  deathPlace?: string

  @ApiProperty({required: false, description: 'JSON string for primary_name'})
  @IsString()
  @IsOptional()
  primaryName?: string

  @ApiProperty({required: false, description: 'JSON string for profile'})
  @IsString()
  @IsOptional()
  profile?: string

  @ApiProperty({required: false, description: 'JSON string for media_list'})
  @IsString()
  @IsOptional()
  mediaList?: string

  @ApiProperty({required: false, description: 'JSON string for event_ref_list'})
  @IsString()
  @IsOptional()
  eventRefList?: string
}
