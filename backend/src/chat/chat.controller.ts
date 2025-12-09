import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  Res,
  Request,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger'
import {Response} from 'express'
import {ChatService} from './chat.service'
import {CreateChatMessageDto, UpdateChatMessageDto} from './dto/chat.dto'
import {Roles} from '../auth/decorators/auth.decorator'

@ApiTags('Chat')
@ApiBearerAuth('JWT-auth')
@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @Roles('member', 'contributor', 'editor', 'owner')
  @ApiOperation({summary: 'Send a chat message'})
  @ApiResponse({status: 201, description: 'Message sent successfully'})
  create(@Request() req: any, @Body() createDto: CreateChatMessageDto) {
    return this.chatService.create(req.user.userId, createDto)
  }

  @Get()
  @ApiOperation({summary: 'Get chat messages'})
  @ApiResponse({status: 200, description: 'List of messages'})
  @ApiQuery({name: 'channelId', required: false, description: 'Filter by channel'})
  @ApiQuery({name: 'contextType', required: false, description: 'Filter by context type'})
  @ApiQuery({name: 'contextId', required: false, description: 'Filter by context ID'})
  @ApiQuery({name: 'page', required: false, description: 'Page number'})
  @ApiQuery({name: 'pagesize', required: false, description: 'Page size'})
  async findAll(
    @Query('channelId') channelId?: string,
    @Query('contextType') contextType?: string,
    @Query('contextId') contextId?: string,
    @Query('page') page?: string,
    @Query('pagesize') pagesize?: string,
    @Res({passthrough: true}) res?: Response,
  ) {
    const result = await this.chatService.findAll({
      channelId,
      contextType,
      contextId,
      page: page ? parseInt(page) : undefined,
      pagesize: pagesize ? parseInt(pagesize) : undefined,
    })

    res?.setHeader('X-Total-Count', result.total.toString())
    res?.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')

    return result.data
  }

  @Get(':id')
  @ApiOperation({summary: 'Get message by ID'})
  @ApiResponse({status: 200, description: 'Message details'})
  @ApiResponse({status: 404, description: 'Message not found'})
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(id)
  }

  @Put(':id')
  @Roles('member', 'contributor', 'editor', 'owner')
  @ApiOperation({summary: 'Edit a message'})
  @ApiResponse({status: 200, description: 'Message updated successfully'})
  @ApiResponse({status: 404, description: 'Message not found'})
  @ApiResponse({status: 403, description: 'Cannot edit others messages'})
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateChatMessageDto,
  ) {
    return this.chatService.update(id, req.user.userId, updateDto)
  }

  @Delete(':id')
  @Roles('member', 'contributor', 'editor', 'owner')
  @HttpCode(204)
  @ApiOperation({summary: 'Delete a message'})
  @ApiResponse({status: 204, description: 'Message deleted successfully'})
  @ApiResponse({status: 404, description: 'Message not found'})
  @ApiResponse({status: 403, description: 'Cannot delete others messages'})
  remove(@Request() req: any, @Param('id') id: string) {
    return this.chatService.remove(id, req.user.userId, req.user.role)
  }
}
