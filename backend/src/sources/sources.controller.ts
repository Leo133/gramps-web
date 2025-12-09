import {Controller, Get, Post, Put, Delete, Body, Param} from '@nestjs/common'
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger'
import {SourcesService} from './sources.service'

@ApiTags('Sources')
@ApiBearerAuth('JWT-auth')
@Controller('api/sources')
export class SourcesController {
  constructor(private readonly service: SourcesService) {}

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Get(':handle')
  findOne(@Param('handle') handle: string) {
    return this.service.findOne(handle)
  }

  @Post()
  create(@Body() data: any) {
    return this.service.create(data)
  }

  @Put(':handle')
  update(@Param('handle') handle: string, @Body() data: any) {
    return this.service.update(handle, data)
  }

  @Delete(':handle')
  remove(@Param('handle') handle: string) {
    return this.service.remove(handle)
  }
}
