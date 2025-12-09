import {Module} from '@nestjs/common'
import {TreeSettingsService} from './tree-settings.service'
import {TreeSettingsController} from './tree-settings.controller'

@Module({
  controllers: [TreeSettingsController],
  providers: [TreeSettingsService],
  exports: [TreeSettingsService],
})
export class TreeSettingsModule {}
