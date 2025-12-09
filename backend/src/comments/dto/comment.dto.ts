import {IsString, IsOptional} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'

export class CreateCommentDto {
  @ApiProperty({description: 'Comment content'})
  @IsString()
  content: string

  @ApiProperty({description: 'Type of entity (Person, Family, Media, etc.)'})
  @IsString()
  entityType: string

  @ApiProperty({description: 'Handle/ID of the entity'})
  @IsString()
  entityId: string

  @ApiProperty({
    required: false,
    description: 'Parent comment ID for threaded comments',
  })
  @IsString()
  @IsOptional()
  parentId?: string
}

export class UpdateCommentDto {
  @ApiProperty({description: 'Updated comment content'})
  @IsString()
  content: string
}
