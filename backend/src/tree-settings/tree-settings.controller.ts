import {Controller, Get, Put, Body} from '@nestjs/common'
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger'
import {TreeSettingsService} from './tree-settings.service'
import {Roles} from '../auth/decorators/auth.decorator'

@ApiTags('TreeSettings')
@ApiBearerAuth('JWT-auth')
@Controller('api/trees/-')
export class TreeSettingsController {
  constructor(private readonly service: TreeSettingsService) {}

  @Get()
  getSettings() {
    return this.service.getSettings()
  }

  @Put()
  @Roles('owner', 'editor')
  updateSettings(@Body() data: any) {
    return this.service.updateSettings(data)
  }
}
