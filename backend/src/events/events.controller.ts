import {Controller, Get, Post, Put, Delete, Body, Param} from '@nestjs/common'
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger'
import {EventsService} from './events.service'

@ApiTags('Events')
@ApiBearerAuth('JWT-auth')
@Controller('api/events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

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
