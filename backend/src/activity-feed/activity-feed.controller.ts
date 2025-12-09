import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
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
import {ActivityFeedService} from './activity-feed.service'
import {CreateActivityDto} from './dto/activity.dto'
import {Roles} from '../auth/decorators/auth.decorator'

@ApiTags('Activity Feed')
@ApiBearerAuth('JWT-auth')
@Controller('api/activity')
export class ActivityFeedController {
  constructor(private readonly activityFeedService: ActivityFeedService) {}

  @Post()
  @Roles('contributor', 'editor', 'owner')
  @ApiOperation({summary: 'Log an activity'})
  @ApiResponse({status: 201, description: 'Activity logged successfully'})
  create(@Request() req: any, @Body() createDto: CreateActivityDto) {
    return this.activityFeedService.create(req.user.userId, createDto)
  }

  @Get()
  @ApiOperation({summary: 'Get activity feed'})
  @ApiResponse({status: 200, description: 'List of activities'})
  @ApiQuery({name: 'entityType', required: false, description: 'Filter by entity type'})
  @ApiQuery({name: 'entityId', required: false, description: 'Filter by entity ID'})
  @ApiQuery({name: 'visibility', required: false, description: 'Filter by visibility'})
  @ApiQuery({name: 'page', required: false, description: 'Page number'})
  @ApiQuery({name: 'pagesize', required: false, description: 'Page size'})
  async findAll(
    @Request() req: any,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('visibility') visibility?: string,
    @Query('page') page?: string,
    @Query('pagesize') pagesize?: string,
    @Res({passthrough: true}) res?: Response,
  ) {
    const result = await this.activityFeedService.findAll({
      entityType,
      entityId,
      visibility,
      userRole: req.user?.role,
      page: page ? parseInt(page) : undefined,
      pagesize: pagesize ? parseInt(pagesize) : undefined,
    })

    res?.setHeader('X-Total-Count', result.total.toString())
    res?.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')

    return result.data
  }

  @Get(':id')
  @ApiOperation({summary: 'Get activity by ID'})
  @ApiResponse({status: 200, description: 'Activity details'})
  @ApiResponse({status: 404, description: 'Activity not found'})
  findOne(@Param('id') id: string) {
    return this.activityFeedService.findOne(id)
  }
}
