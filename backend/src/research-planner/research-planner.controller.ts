import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import {
  ResearchPlannerService,
  CreateTaskDto,
  UpdateTaskDto,
} from './research-planner.service'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import {CurrentUser} from '../auth/decorators/current-user.decorator'

@ApiTags('research-planner')
@Controller('research-planner')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ResearchPlannerController {
  constructor(
    private readonly researchPlannerService: ResearchPlannerService,
  ) {}

  @Post('tasks')
  @ApiOperation({summary: 'Create a new research task'})
  @ApiResponse({status: 201, description: 'Task created'})
  async createTask(@CurrentUser() user: any, @Body() data: CreateTaskDto) {
    return this.researchPlannerService.createTask(user.id, data)
  }

  @Get('tasks')
  @ApiOperation({summary: 'Get all tasks for the current user'})
  @ApiResponse({status: 200, description: 'Tasks returned'})
  async getTasks(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
  ) {
    return this.researchPlannerService.getUserTasks(user.id, {
      status,
      priority,
      category,
    })
  }

  @Get('board')
  @ApiOperation({summary: 'Get Kanban board view of tasks'})
  @ApiResponse({status: 200, description: 'Board returned'})
  async getBoard(@CurrentUser() user: any) {
    return this.researchPlannerService.getKanbanBoard(user.id)
  }

  @Get('statistics')
  @ApiOperation({summary: 'Get task statistics'})
  @ApiResponse({status: 200, description: 'Statistics returned'})
  async getStatistics(@CurrentUser() user: any) {
    return this.researchPlannerService.getStatistics(user.id)
  }

  @Put('tasks/:id')
  @ApiOperation({summary: 'Update a task'})
  @ApiResponse({status: 200, description: 'Task updated'})
  async updateTask(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() data: UpdateTaskDto,
  ) {
    return this.researchPlannerService.updateTask(id, user.id, data)
  }

  @Delete('tasks/:id')
  @ApiOperation({summary: 'Delete a task'})
  @ApiResponse({status: 200, description: 'Task deleted'})
  async deleteTask(@Param('id') id: string, @CurrentUser() user: any) {
    await this.researchPlannerService.deleteTask(id, user.id)
    return {success: true}
  }
}
