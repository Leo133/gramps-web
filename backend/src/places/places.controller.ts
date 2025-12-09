import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common'
import {ApiTags, ApiBearerAuth, ApiQuery} from '@nestjs/swagger'
import {PlacesService} from './places.service'
import {
  CreatePlaceDto,
  UpdatePlaceDto,
  GeocodeQueryDto,
  ReverseGeocodeDto,
} from './dto/place.dto'

@ApiTags('Places')
@ApiBearerAuth('JWT-auth')
@Controller('api/places')
export class PlacesController {
  constructor(private readonly service: PlacesService) {}

  @Get()
  @ApiQuery({name: 'q', required: false})
  @ApiQuery({name: 'page', required: false})
  @ApiQuery({name: 'pagesize', required: false})
  @ApiQuery({name: 'gramps_id', required: false})
  @ApiQuery({name: 'locale', required: false})
  @ApiQuery({name: 'profile', required: false})
  @ApiQuery({name: 'backlinks', required: false})
  findAll(@Query() query: any) {
    return this.service.findAll(query)
  }

  @Get('clusters')
  @ApiQuery({name: 'zoom', required: false})
  getEventClusters(@Query('zoom') zoom?: number) {
    return this.service.getEventClusters(zoom)
  }

  @Get('geocode')
  @ApiQuery({name: 'query', required: true})
  geocode(@Query('query') query: string) {
    return this.service.geocode(query)
  }

  @Get('reverse-geocode')
  @ApiQuery({name: 'latitude', required: true})
  @ApiQuery({name: 'longitude', required: true})
  reverseGeocode(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string
  ) {
    return this.service.reverseGeocode(
      parseFloat(latitude),
      parseFloat(longitude)
    )
  }

  @Get(':handle')
  findOne(@Param('handle') handle: string) {
    return this.service.findOne(handle)
  }

  @Post()
  create(@Body() data: CreatePlaceDto) {
    return this.service.create(data)
  }

  @Put(':handle')
  update(@Param('handle') handle: string, @Body() data: UpdatePlaceDto) {
    return this.service.update(handle, data)
  }

  @Delete(':handle')
  remove(@Param('handle') handle: string) {
    return this.service.remove(handle)
  }
}
