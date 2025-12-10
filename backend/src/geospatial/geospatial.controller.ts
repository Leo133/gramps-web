import {Controller, Get, Query, Param} from '@nestjs/common'
import {ApiTags, ApiBearerAuth, ApiQuery} from '@nestjs/swagger'
import {GeospatialService} from './geospatial.service'

@ApiTags('Geospatial')
@ApiBearerAuth('JWT-auth')
@Controller('api/geospatial')
export class GeospatialController {
  constructor(private readonly service: GeospatialService) {}

  @Get('migration-flows')
  @ApiQuery({name: 'person', required: false})
  getMigrationFlows(@Query('person') personHandle?: string) {
    return this.service.getMigrationFlows(personHandle)
  }

  @Get('migration-flows/:handle')
  getPersonMigrationFlow(@Param('handle') handle: string) {
    return this.service.getMigrationFlows(handle)
  }

  @Get('clusters')
  @ApiQuery({name: 'zoom', required: false})
  @ApiQuery({name: 'north', required: false})
  @ApiQuery({name: 'south', required: false})
  @ApiQuery({name: 'east', required: false})
  @ApiQuery({name: 'west', required: false})
  getPlaceClusters(
    @Query('zoom') zoom?: string,
    @Query('north') north?: string,
    @Query('south') south?: string,
    @Query('east') east?: string,
    @Query('west') west?: string,
  ) {
    const options: any = {}

    if (zoom) {
      options.zoom = parseInt(zoom, 10)
    }

    if (north && south && east && west) {
      options.bounds = {
        north: parseFloat(north),
        south: parseFloat(south),
        east: parseFloat(east),
        west: parseFloat(west),
      }
    }

    return this.service.getPlaceClusters(options)
  }
}
