import {Module} from '@nestjs/common'
import {ResearchPlannerService} from './research-planner.service'
import {ResearchPlannerController} from './research-planner.controller'
import {PrismaModule} from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [ResearchPlannerController],
  providers: [ResearchPlannerService],
  exports: [ResearchPlannerService],
})
export class ResearchPlannerModule {}
