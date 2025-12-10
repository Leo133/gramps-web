import {Module} from '@nestjs/common'
import {GrampsXmlService} from './gramps-xml.service'
import {GrampsXmlController} from './gramps-xml.controller'
import {PrismaModule} from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [GrampsXmlController],
  providers: [GrampsXmlService],
  exports: [GrampsXmlService],
})
export class GrampsXmlModule {}
