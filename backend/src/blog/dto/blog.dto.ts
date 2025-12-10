import {IsString, IsOptional, IsArray, IsDateString} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'

export class CreateBlogPostDto {
  @ApiProperty({description: 'Blog post title'})
  @IsString()
  title: string

  @ApiProperty({description: 'URL-friendly slug'})
  @IsString()
  slug: string

  @ApiProperty({description: 'Post content (HTML or Markdown)'})
  @IsString()
  content: string

  @ApiProperty({required: false, description: 'Post excerpt/summary'})
  @IsString()
  @IsOptional()
  excerpt?: string

  @ApiProperty({
    required: false,
    description: 'Post status',
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  @IsString()
  @IsOptional()
  status?: string

  @ApiProperty({
    required: false,
    description: 'Visibility level',
    enum: ['public', 'private', 'members'],
    default: 'public',
  })
  @IsString()
  @IsOptional()
  visibility?: string

  @ApiProperty({
    required: false,
    description: 'Featured image handle or URL',
  })
  @IsString()
  @IsOptional()
  featuredImage?: string

  @ApiProperty({
    required: false,
    description: 'Tags as JSON array',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  tags?: string[]

  @ApiProperty({
    required: false,
    description: 'Categories as JSON array',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  categories?: string[]

  @ApiProperty({
    required: false,
    description: 'Publish date (ISO 8601)',
  })
  @IsDateString()
  @IsOptional()
  publishedAt?: string
}

export class UpdateBlogPostDto {
  @ApiProperty({required: false, description: 'Blog post title'})
  @IsString()
  @IsOptional()
  title?: string

  @ApiProperty({required: false, description: 'URL-friendly slug'})
  @IsString()
  @IsOptional()
  slug?: string

  @ApiProperty({
    required: false,
    description: 'Post content (HTML or Markdown)',
  })
  @IsString()
  @IsOptional()
  content?: string

  @ApiProperty({required: false, description: 'Post excerpt/summary'})
  @IsString()
  @IsOptional()
  excerpt?: string

  @ApiProperty({
    required: false,
    description: 'Post status',
    enum: ['draft', 'published', 'archived'],
  })
  @IsString()
  @IsOptional()
  status?: string

  @ApiProperty({
    required: false,
    description: 'Visibility level',
    enum: ['public', 'private', 'members'],
  })
  @IsString()
  @IsOptional()
  visibility?: string

  @ApiProperty({
    required: false,
    description: 'Featured image handle or URL',
  })
  @IsString()
  @IsOptional()
  featuredImage?: string

  @ApiProperty({
    required: false,
    description: 'Tags as JSON array',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  tags?: string[]

  @ApiProperty({
    required: false,
    description: 'Categories as JSON array',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  categories?: string[]

  @ApiProperty({
    required: false,
    description: 'Publish date (ISO 8601)',
  })
  @IsDateString()
  @IsOptional()
  publishedAt?: string
}
