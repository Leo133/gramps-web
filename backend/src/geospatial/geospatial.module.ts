import {Module} from '@nestjs/common'
import {GeospatialService} from './geospatial.service'
import {GeospatialController} from './geospatial.controller'
import {PrismaModule} from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [GeospatialController],
  providers: [GeospatialService],
  exports: [GeospatialService],
})
export class GeospatialModule {}
