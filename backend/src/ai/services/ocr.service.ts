import {Injectable, NotFoundException} from '@nestjs/common'
import {PrismaService} from '../../prisma/prisma.service'
import {ConfigService} from '@nestjs/config'

// Constants for OCR processing
const DEFAULT_CONFIDENCE_MIN = 0.85
const DEFAULT_CONFIDENCE_MAX = 0.95

@Injectable()
export class OcrService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Perform OCR on a media file
   */
  async performOcr(
    mediaHandle: string,
    file: Express.Multer.File,
    language: string,
  ) {
    // Verify media exists
    const media = await this.prisma.media.findUnique({
      where: {handle: mediaHandle},
    })

    if (!media) {
      throw new NotFoundException(`Media with handle ${mediaHandle} not found`)
    }

    // Perform OCR (mock implementation - would use Tesseract.js or cloud OCR in production)
    const ocrResult = await this.performOcrProcessing(file, language)

    // Save OCR results
    await this.saveOcrResults(mediaHandle, ocrResult, language)

    return {
      mediaHandle,
      text: ocrResult.text,
      confidence: ocrResult.confidence,
      language,
      processedAt: new Date().toISOString(),
      wordCount: ocrResult.text.split(/\s+/).length,
    }
  }

  /**
   * Get OCR results for a media file
   */
  async getOcrResults(mediaHandle: string) {
    const media = await this.prisma.media.findUnique({
      where: {handle: mediaHandle},
    })

    if (!media) {
      throw new NotFoundException(`Media with handle ${mediaHandle} not found`)
    }

    // Get OCR results from metadata
    const metadata = await this.prisma.metadata.findFirst({
      where: {
        key: `ocr_${mediaHandle}`,
      },
    })

    if (!metadata) {
      return {
        mediaHandle,
        text: null,
        message: 'No OCR results available',
      }
    }

    const ocrData = JSON.parse(metadata.value)
    return {
      mediaHandle,
      text: ocrData.text,
      confidence: ocrData.confidence,
      language: ocrData.language,
      processedAt: ocrData.processedAt,
      wordCount: ocrData.text.split(/\s+/).length,
    }
  }

  /**
   * Perform OCR processing (mock implementation)
   */
  private async performOcrProcessing(
    _file: Express.Multer.File,
    _language: string,
  ): Promise<{text: string; confidence: number}> {
    // In production, this would use Tesseract.js or a cloud OCR service
    // For now, return mock data

    const mockTexts = [
      'This is a sample handwritten document from the 19th century. It contains important genealogical information about the family.',
      'Census Record - 1900\nName: John Smith\nAge: 42\nOccupation: Farmer\nBirth Place: New York',
      'Marriage Certificate\nThis certifies that John Doe and Jane Smith were united in marriage on the 15th day of June, 1875.',
      'Birth Certificate\nName: Mary Johnson\nDate of Birth: March 3, 1890\nPlace: Boston, Massachusetts\nParents: William and Sarah Johnson',
    ]

    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 100))

    return {
      text: mockTexts[Math.floor(Math.random() * mockTexts.length)],
      confidence:
        DEFAULT_CONFIDENCE_MIN +
        Math.random() * (DEFAULT_CONFIDENCE_MAX - DEFAULT_CONFIDENCE_MIN),
    }
  }

  /**
   * Save OCR results to metadata
   */
  private async saveOcrResults(
    mediaHandle: string,
    ocrResult: any,
    language: string = 'eng',
  ) {
    const data = {
      text: ocrResult.text,
      confidence: ocrResult.confidence,
      language,
      processedAt: new Date().toISOString(),
    }

    // Check if OCR results already exist
    const existing = await this.prisma.metadata.findFirst({
      where: {
        key: `ocr_${mediaHandle}`,
      },
    })

    if (existing) {
      // Update existing
      await this.prisma.metadata.update({
        where: {id: existing.id},
        data: {
          value: JSON.stringify(data),
        },
      })
    } else {
      // Create new
      await this.prisma.metadata.create({
        data: {
          key: `ocr_${mediaHandle}`,
          value: JSON.stringify(data),
        },
      })
    }
  }
}
