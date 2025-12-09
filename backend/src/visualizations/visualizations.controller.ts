import {Controller, Post, Body, Get, Param} from '@nestjs/common'
import {ApiTags, ApiOperation, ApiResponse} from '@nestjs/swagger'
import {VisualizationsService} from './visualizations.service'

@ApiTags('visualizations')
@Controller('visualizations')
export class VisualizationsController {
  constructor(private readonly visualizationsService: VisualizationsService) {}

  @Post('calculate-relationship')
  @ApiOperation({summary: 'Calculate relationship between two people'})
  @ApiResponse({
    status: 200,
    description: 'Relationship calculated successfully',
  })
  async calculateRelationship(
    @Body() body: {person1Handle: string; person2Handle: string},
  ) {
    return this.visualizationsService.calculateRelationship(
      body.person1Handle,
      body.person2Handle,
    )
  }

  @Get('fan-chart/:handle')
  @ApiOperation({summary: 'Get optimized fan chart data for a person'})
  @ApiResponse({
    status: 200,
    description: 'Fan chart data retrieved successfully',
  })
  async getFanChartData(@Param('handle') handle: string) {
    return this.visualizationsService.getFanChartData(handle)
  }

  @Get('tree-chart/:handle')
  @ApiOperation({summary: 'Get optimized tree chart data for a person'})
  @ApiResponse({
    status: 200,
    description: 'Tree chart data retrieved successfully',
  })
  async getTreeChartData(@Param('handle') handle: string) {
    return this.visualizationsService.getTreeChartData(handle)
  }

  @Get('descendant-tree/:handle')
  @ApiOperation({summary: 'Get descendant tree data for a person'})
  @ApiResponse({
    status: 200,
    description: 'Descendant tree data retrieved successfully',
  })
  async getDescendantTree(@Param('handle') handle: string) {
    return this.visualizationsService.getDescendantTree(handle)
  }
}
