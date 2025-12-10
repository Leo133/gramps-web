import {Module} from '@nestjs/common'
import {ConfigModule} from '@nestjs/config'
import {PrismaModule} from '../prisma/prisma.module'
import {AiController} from './ai.controller'
import {AiService} from './ai.service'
import {BiographyService} from './services/biography.service'
import {OcrService} from './services/ocr.service'
import {SmartHintsService} from './services/smart-hints.service'
import {FaceRecognitionService} from './services/face-recognition.service'

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AiController],
  providers: [
    AiService,
    BiographyService,
    OcrService,
    SmartHintsService,
    FaceRecognitionService,
  ],
  exports: [AiService],
})
export class AiModule {}
