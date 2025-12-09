import {IsString, IsOptional} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'

export class CreateChatMessageDto {
  @ApiProperty({description: 'Message content'})
  @IsString()
  content: string

  @ApiProperty({required: false, description: 'Channel ID for group chats'})
  @IsString()
  @IsOptional()
  channelId?: string

  @ApiProperty({
    required: false,
    description: 'Type of entity being referenced (Person, Family, etc.)',
  })
  @IsString()
  @IsOptional()
  contextType?: string

  @ApiProperty({
    required: false,
    description: 'Handle of the referenced entity',
  })
  @IsString()
  @IsOptional()
  contextId?: string
}

export class UpdateChatMessageDto {
  @ApiProperty({description: 'Updated message content'})
  @IsString()
  content: string
}
