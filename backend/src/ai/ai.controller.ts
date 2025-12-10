import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import {FileInterceptor} from '@nestjs/platform-express'
import {ApiTags, ApiBearerAuth, ApiConsumes, ApiBody} from '@nestjs/swagger'
import {BiographyService} from './services/biography.service'
import {OcrService} from './services/ocr.service'
import {SmartHintsService} from './services/smart-hints.service'
import {FaceRecognitionService} from './services/face-recognition.service'
import {GenerateBiographyDto} from './dto/generate-biography.dto'

@ApiTags('AI')
@ApiBearerAuth('JWT-auth')
@Controller('api/ai')
export class AiController {
  constructor(
    private readonly biographyService: BiographyService,
    private readonly ocrService: OcrService,
    private readonly smartHintsService: SmartHintsService,
    private readonly faceRecognitionService: FaceRecognitionService,
  ) {}

  /**
   * Generate a narrative biography for a person
   */
  @Post('biography/:handle')
  async generateBiography(
    @Param('handle') handle: string,
    @Body() dto: GenerateBiographyDto,
  ) {
    return this.biographyService.generateBiography(handle, dto)
  }

  /**
   * Get a previously generated biography
   */
  @Get('biography/:handle')
  async getBiography(@Param('handle') handle: string) {
    return this.biographyService.getBiography(handle)
  }

  /**
   * Perform OCR on a media file
   */
  @Post('ocr/:mediaHandle')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        language: {
          type: 'string',
          default: 'eng',
        },
      },
    },
  })
  async performOcr(
    @Param('mediaHandle') mediaHandle: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('language') language = 'eng',
  ) {
    return this.ocrService.performOcr(mediaHandle, file, language)
  }

  /**
   * Get OCR results for a media file
   */
  @Get('ocr/:mediaHandle')
  async getOcrResults(@Param('mediaHandle') mediaHandle: string) {
    return this.ocrService.getOcrResults(mediaHandle)
  }

  /**
   * Get smart hints for a person (missing events, potential parents, etc.)
   */
  @Get('hints/person/:handle')
  async getPersonHints(@Param('handle') handle: string) {
    return this.smartHintsService.getPersonHints(handle)
  }

  /**
   * Get data quality issues across the tree
   */
  @Get('hints/quality')
  async getDataQualityIssues() {
    return this.smartHintsService.getDataQualityIssues()
  }

  /**
   * Detect faces in a photo
   */
  @Post('faces/detect/:mediaHandle')
  async detectFaces(@Param('mediaHandle') mediaHandle: string) {
    return this.faceRecognitionService.detectFaces(mediaHandle)
  }

  /**
   * Tag a face with a person
   */
  @Post('faces/tag')
  async tagFace(@Body() data: {mediaHandle: string; faceId: string; personHandle: string}) {
    return this.faceRecognitionService.tagFace(
      data.mediaHandle,
      data.faceId,
      data.personHandle,
    )
  }

  /**
   * Get all face tags for a media file
   */
  @Get('faces/:mediaHandle')
  async getFaceTags(@Param('mediaHandle') mediaHandle: string) {
    return this.faceRecognitionService.getFaceTags(mediaHandle)
  }

  /**
   * Auto-tag faces across all media using face recognition
   */
  @Post('faces/auto-tag')
  async autoTagFaces(@Body() data: {mediaHandle?: string}) {
    return this.faceRecognitionService.autoTagFaces(data.mediaHandle)
  }
}
