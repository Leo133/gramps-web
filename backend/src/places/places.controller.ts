import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PlacesService } from './places.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('places')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  findAll() {
    return this.placesService.findAll();
  }

  @Get(':handle')
  findOne(@Param('handle') handle: string) {
    return this.placesService.findOne(handle);
  }
}
