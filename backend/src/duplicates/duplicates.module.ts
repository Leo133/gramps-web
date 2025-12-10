import {Module} from '@nestjs/common'
import {DuplicatesService} from './duplicates.service'
import {DuplicatesController} from './duplicates.controller'
import {PrismaModule} from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [DuplicatesController],
  providers: [DuplicatesService],
  exports: [DuplicatesService],
})
export class DuplicatesModule {}
