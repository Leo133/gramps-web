import {Controller, Get, Query} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger'
import {TimelineService} from '../people/timeline.service'

@ApiTags('Timelines')
@ApiBearerAuth('JWT-auth')
@Controller('api/timelines')
export class TimelinesController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get('compare')
  @ApiOperation({summary: 'Compare timelines of multiple people'})
  @ApiResponse({status: 200, description: 'Comparative timeline data'})
  @ApiQuery({
    name: 'handles',
    required: true,
    description: 'Comma-separated list of person handles',
  })
  async compareTimelines(@Query('handles') handles: string) {
    const handleArray = handles.split(',').map(h => h.trim())
    return this.timelineService.getComparativeTimeline(handleArray)
  }

  @Get('age-analysis')
  @ApiOperation({summary: 'Get age analysis statistics'})
  @ApiResponse({status: 200, description: 'Age analysis data'})
  @ApiQuery({
    name: 'handles',
    required: false,
    description: 'Optional comma-separated list of person handles to analyze',
  })
  async ageAnalysis(@Query('handles') handles?: string) {
    const handleArray = handles
      ? handles.split(',').map(h => h.trim())
      : undefined
    return this.timelineService.getAgeAnalysis(handleArray)
  }
}
