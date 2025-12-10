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
import {BlogService} from './blog.service'
import {CreateBlogPostDto, UpdateBlogPostDto} from './dto/blog.dto'
import {Roles} from '../auth/decorators/auth.decorator'

@ApiTags('Blog')
@ApiBearerAuth('JWT-auth')
@Controller('api/blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @Roles('contributor', 'editor', 'owner')
  @ApiOperation({summary: 'Create a blog post'})
  @ApiResponse({status: 201, description: 'Blog post created successfully'})
  @ApiResponse({status: 409, description: 'Slug already exists'})
  create(@Request() req: any, @Body() createDto: CreateBlogPostDto) {
    return this.blogService.create(req.user.userId, createDto)
  }

  @Get()
  @ApiOperation({summary: 'Get all blog posts'})
  @ApiResponse({status: 200, description: 'List of blog posts'})
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (draft, published, archived)',
  })
  @ApiQuery({
    name: 'visibility',
    required: false,
    description: 'Filter by visibility (public, private, members)',
  })
  @ApiQuery({
    name: 'authorId',
    required: false,
    description: 'Filter by author ID',
  })
  @ApiQuery({name: 'tag', required: false, description: 'Filter by tag'})
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({name: 'page', required: false, description: 'Page number'})
  @ApiQuery({name: 'pagesize', required: false, description: 'Page size'})
  async findAll(
    @Query('status') status?: string,
    @Query('visibility') visibility?: string,
    @Query('authorId') authorId?: string,
    @Query('tag') tag?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('pagesize') pagesize?: string,
    @Res({passthrough: true}) res?: Response,
  ) {
    const result = await this.blogService.findAll({
      status,
      visibility,
      authorId,
      tag,
      category,
      page: page ? parseInt(page) : undefined,
      pagesize: pagesize ? parseInt(pagesize) : undefined,
    })

    res?.setHeader('X-Total-Count', result.total.toString())
    res?.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')

    return result.data
  }

  @Get('tags')
  @ApiOperation({summary: 'Get all blog tags'})
  @ApiResponse({status: 200, description: 'List of tags'})
  getTags() {
    return this.blogService.getTags()
  }

  @Get('categories')
  @ApiOperation({summary: 'Get all blog categories'})
  @ApiResponse({status: 200, description: 'List of categories'})
  getCategories() {
    return this.blogService.getCategories()
  }

  @Get('slug/:slug')
  @ApiOperation({summary: 'Get blog post by slug'})
  @ApiResponse({status: 200, description: 'Blog post details'})
  @ApiResponse({status: 404, description: 'Blog post not found'})
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug)
  }

  @Get(':id')
  @ApiOperation({summary: 'Get blog post by ID'})
  @ApiResponse({status: 200, description: 'Blog post details'})
  @ApiResponse({status: 404, description: 'Blog post not found'})
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id)
  }

  @Put(':id')
  @Roles('contributor', 'editor', 'owner')
  @ApiOperation({summary: 'Update a blog post'})
  @ApiResponse({status: 200, description: 'Blog post updated successfully'})
  @ApiResponse({status: 404, description: 'Blog post not found'})
  @ApiResponse({status: 403, description: 'Cannot edit others blog posts'})
  @ApiResponse({status: 409, description: 'Slug already exists'})
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateBlogPostDto,
  ) {
    return this.blogService.update(id, req.user.userId, req.user.role, updateDto)
  }

  @Delete(':id')
  @Roles('contributor', 'editor', 'owner')
  @HttpCode(204)
  @ApiOperation({summary: 'Delete a blog post'})
  @ApiResponse({status: 204, description: 'Blog post deleted successfully'})
  @ApiResponse({status: 404, description: 'Blog post not found'})
  @ApiResponse({status: 403, description: 'Cannot delete others blog posts'})
  remove(@Request() req: any, @Param('id') id: string) {
    return this.blogService.remove(id, req.user.userId, req.user.role)
  }
}
