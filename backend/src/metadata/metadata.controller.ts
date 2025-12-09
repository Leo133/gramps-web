import {Controller, Get} from '@nestjs/common'
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger'
import {MetadataService} from './metadata.service'
import {Public} from '../auth/decorators/auth.decorator'

@ApiTags('Metadata')
@Controller('api/metadata')
export class MetadataController {
  constructor(private readonly service: MetadataService) {}

  @Public()
  @Get()
  getMetadata() {
    return this.service.getMetadata()
  }
}
