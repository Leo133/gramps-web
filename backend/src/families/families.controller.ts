import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FamiliesService } from './families.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('families')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Get()
  findAll() {
    return this.familiesService.findAll();
  }

  @Get(':handle')
  findOne(@Param('handle') handle: string) {
    return this.familiesService.findOne(handle);
  }
}
