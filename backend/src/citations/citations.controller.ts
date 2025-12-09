import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CitationsService } from './citations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('citations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('citations')
export class CitationsController {
  constructor(private readonly citationsService: CitationsService) {}

  @Get()
  findAll() {
    return this.citationsService.findAll();
  }

  @Get(':handle')
  findOne(@Param('handle') handle: string) {
    return this.citationsService.findOne(handle);
  }
}
