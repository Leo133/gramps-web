import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MetadataService } from './metadata.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('metadata')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('metadata')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get()
  findAll() {
    return this.metadataService.findAll();
  }

  @Get(':handle')
  findOne(@Param('handle') handle: string) {
    return this.metadataService.findOne(handle);
  }
}
