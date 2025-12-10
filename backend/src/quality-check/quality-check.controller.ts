import {Controller, Get, Param, UseGuards} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import {QualityCheckService} from './quality-check.service'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'

@ApiTags('quality')
@Controller('quality')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QualityCheckController {
  constructor(private readonly qualityCheckService: QualityCheckService) {}

  @Get('dashboard')
  @ApiOperation({summary: 'Get data quality dashboard'})
  @ApiResponse({status: 200, description: 'Dashboard data returned'})
  async getDashboard() {
    return this.qualityCheckService.getDashboard()
  }

  @Get('person/:id')
  @ApiOperation({summary: 'Check quality for a specific person'})
  @ApiResponse({status: 200, description: 'Quality check results returned'})
  async checkPerson(@Param('id') id: string) {
    return this.qualityCheckService.checkPersonQuality(id)
  }

  @Get('disconnected')
  @ApiOperation({summary: 'Find disconnected branches in the family tree'})
  @ApiResponse({status: 200, description: 'Disconnected branches returned'})
  async findDisconnected() {
    const branches = await this.qualityCheckService.findDisconnectedBranches()
    return {
      count: branches.length,
      branches,
    }
  }
}
