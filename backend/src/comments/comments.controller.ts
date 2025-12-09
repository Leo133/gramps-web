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
import {CommentsService} from './comments.service'
import {CreateCommentDto, UpdateCommentDto} from './dto/comment.dto'
import {Roles} from '../auth/decorators/auth.decorator'

@ApiTags('Comments')
@ApiBearerAuth('JWT-auth')
@Controller('api/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Roles('member', 'contributor', 'editor', 'owner')
  @ApiOperation({summary: 'Add a comment'})
  @ApiResponse({status: 201, description: 'Comment created successfully'})
  create(@Request() req: any, @Body() createDto: CreateCommentDto) {
    return this.commentsService.create(req.user.userId, createDto)
  }

  @Get()
  @ApiOperation({summary: 'Get comments'})
  @ApiResponse({status: 200, description: 'List of comments'})
  @ApiQuery({name: 'entityType', required: false, description: 'Filter by entity type'})
  @ApiQuery({name: 'entityId', required: false, description: 'Filter by entity ID'})
  @ApiQuery({name: 'parentId', required: false, description: 'Filter by parent comment ID (use "null" for top-level)'})
  @ApiQuery({name: 'page', required: false, description: 'Page number'})
  @ApiQuery({name: 'pagesize', required: false, description: 'Page size'})
  async findAll(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('parentId') parentId?: string,
    @Query('page') page?: string,
    @Query('pagesize') pagesize?: string,
    @Res({passthrough: true}) res?: Response,
  ) {
    const result = await this.commentsService.findAll({
      entityType,
      entityId,
      parentId: parentId === 'null' ? null : parentId,
      page: page ? parseInt(page) : undefined,
      pagesize: pagesize ? parseInt(pagesize) : undefined,
    })

    res?.setHeader('X-Total-Count', result.total.toString())
    res?.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')

    return result.data
  }

  @Get(':id')
  @ApiOperation({summary: 'Get comment by ID'})
  @ApiResponse({status: 200, description: 'Comment details'})
  @ApiResponse({status: 404, description: 'Comment not found'})
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id)
  }

  @Put(':id')
  @Roles('member', 'contributor', 'editor', 'owner')
  @ApiOperation({summary: 'Edit a comment'})
  @ApiResponse({status: 200, description: 'Comment updated successfully'})
  @ApiResponse({status: 404, description: 'Comment not found'})
  @ApiResponse({status: 403, description: 'Cannot edit others comments'})
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, req.user.userId, updateDto)
  }

  @Delete(':id')
  @Roles('member', 'contributor', 'editor', 'owner')
  @HttpCode(204)
  @ApiOperation({summary: 'Delete a comment'})
  @ApiResponse({status: 204, description: 'Comment deleted successfully'})
  @ApiResponse({status: 404, description: 'Comment not found'})
  @ApiResponse({status: 403, description: 'Cannot delete others comments'})
  remove(@Request() req: any, @Param('id') id: string) {
    return this.commentsService.remove(id, req.user.userId, req.user.role)
  }
}
