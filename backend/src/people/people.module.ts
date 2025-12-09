import {Module} from '@nestjs/common'
import {PeopleService} from './people.service'
import {TimelineService} from './timeline.service'
import {PeopleController} from './people.controller'
import {TimelinesController} from './timelines.controller'

@Module({
  controllers: [PeopleController, TimelinesController],
  providers: [PeopleService, TimelineService],
  exports: [PeopleService, TimelineService],
})
export class PeopleModule {}
