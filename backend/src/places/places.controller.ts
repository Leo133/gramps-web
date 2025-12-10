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
    @Query('longitude') longitude: string,
  ) {
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)

    // Validate coordinates
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return {
        error: 'Invalid coordinates',
        message: 'Latitude and longitude must be valid numbers',
      }
    }

    if (lat < -90 || lat > 90) {
      return {
        error: 'Invalid latitude',
        message: 'Latitude must be between -90 and 90',
      }
    }

    if (lng < -180 || lng > 180) {
      return {
        error: 'Invalid longitude',
        message: 'Longitude must be between -180 and 180',
      }
    }

    return this.service.reverseGeocode(lat, lng)
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
