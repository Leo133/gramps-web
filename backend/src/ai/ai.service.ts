import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'

@Injectable()
export class AiService {
  constructor(private configService: ConfigService) {}

  /**
   * Get AI configuration
   */
  getAiConfig() {
    return {
      openaiApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      openaiModel: this.configService.get<string>('OPENAI_MODEL', 'gpt-4'),
      ocrEnabled: this.configService.get<boolean>('OCR_ENABLED', true),
      faceRecognitionEnabled: this.configService.get<boolean>(
        'FACE_RECOGNITION_ENABLED',
        true,
      ),
      smartHintsEnabled: this.configService.get<boolean>(
        'SMART_HINTS_ENABLED',
        true,
      ),
    }
  }

  /**
   * Check if AI features are enabled
   */
  isAiEnabled(): boolean {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')
    return !!apiKey
  }
}
