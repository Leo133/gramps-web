import {Injectable, NotFoundException} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {PrismaService} from '../../prisma/prisma.service'
import {GenerateBiographyDto} from '../dto/generate-biography.dto'

// Constants for AI API
const DEFAULT_BIOGRAPHY_LENGTH = 500
const TOKEN_MULTIPLIER = 1.5

@Injectable()
export class BiographyService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate a narrative biography for a person using AI
   */
  async generateBiography(handle: string, dto: GenerateBiographyDto) {
    // Find the person
    const person = await this.prisma.person.findUnique({
      where: {handle},
    })

    if (!person) {
      throw new NotFoundException(`Person with handle ${handle} not found`)
    }

    // Get related data
    const events = dto.includeEvents
      ? await this.prisma.event.findMany({
          where: {personHandle: handle},
        })
      : []

    const families = dto.includeFamily
      ? await this.prisma.family.findMany({
          where: {
            OR: [{fatherHandle: handle}, {motherHandle: handle}],
          },
        })
      : []

    // Build context for AI
    const context = this.buildBiographyContext(person, events, families, dto)

    // Generate biography using AI
    const biography = await this.callAiApi(context, dto)

    // Save the generated biography
    await this.saveBiography(handle, biography)

    return {
      handle,
      biography,
      generatedAt: new Date().toISOString(),
      style: dto.style,
      wordCount: biography.split(/\s+/).length,
    }
  }

  /**
   * Get a previously generated biography
   */
  async getBiography(handle: string) {
    const person = await this.prisma.person.findUnique({
      where: {handle},
    })

    if (!person) {
      throw new NotFoundException(`Person with handle ${handle} not found`)
    }

    // Check if person has a biography in their profile
    const profile = person.profile ? JSON.parse(person.profile) : {}
    const biography = profile.biography || null

    if (!biography) {
      return {
        handle,
        biography: null,
        message: 'No biography generated yet',
      }
    }

    return {
      handle,
      biography: biography.text,
      generatedAt: biography.generatedAt,
      style: biography.style,
      wordCount: biography.text.split(/\s+/).length,
    }
  }

  /**
   * Build context for AI biography generation
   */
  private buildBiographyContext(
    person: any,
    events: any[],
    families: any[],
    dto: GenerateBiographyDto,
  ): string {
    let context = `Generate a ${dto.style} biography for:\n\n`

    // Basic info
    context += `Name: ${person.firstName || ''} ${person.surname || ''}\n`
    if (person.gender === 0) context += `Gender: Female\n`
    if (person.gender === 1) context += `Gender: Male\n`
    if (person.birthDate) context += `Birth: ${person.birthDate}\n`
    if (person.birthPlace) context += `Birth Place: ${person.birthPlace}\n`
    if (person.deathDate) context += `Death: ${person.deathDate}\n`
    if (person.deathPlace) context += `Death Place: ${person.deathPlace}\n`

    // Events
    if (dto.includeEvents && events.length > 0) {
      context += `\nLife Events:\n`
      events.forEach(event => {
        context += `- ${event.type}`
        if (event.date) context += ` (${event.date})`
        if (event.place) context += ` at ${event.place}`
        if (event.description) context += `: ${event.description}`
        context += `\n`
      })
    }

    // Family relationships
    if (dto.includeFamily && families.length > 0) {
      context += `\nFamily Relationships: ${families.length} families\n`
    }

    // Custom instructions
    if (dto.customInstructions) {
      context += `\nAdditional Instructions: ${dto.customInstructions}\n`
    }

    context += `\nTarget Length: approximately ${dto.length} words\n`

    return context
  }

  /**
   * Call AI API to generate biography
   */
  private async callAiApi(
    context: string,
    dto: GenerateBiographyDto,
  ): Promise<string> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')

    if (!apiKey) {
      // Return a mock biography if no API key is configured
      return this.generateMockBiography(context, dto)
    }

    try {
      // Call OpenAI API
      const model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4')
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content:
                  'You are a professional genealogist and biographer. Generate compelling, accurate biographies based on the provided genealogical data. Write in a clear, engaging style appropriate to the requested format.',
              },
              {
                role: 'user',
                content: context,
              },
            ],
            max_tokens: Math.ceil(
              (dto.length || DEFAULT_BIOGRAPHY_LENGTH) * TOKEN_MULTIPLIER,
            ), // Allow some overhead
            temperature: 0.7,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0].message.content.trim()
    } catch (error) {
      console.error('Error calling AI API:', error)
      // Fall back to mock if API fails
      return this.generateMockBiography(context, dto)
    }
  }

  /**
   * Generate a mock biography for testing (when no AI API is available)
   */
  private generateMockBiography(
    context: string,
    _dto: GenerateBiographyDto,
  ): string {
    const lines = context.split('\n')
    const name =
      lines.find(l => l.startsWith('Name:'))?.replace('Name: ', '') ||
      'This person'
    const birth = lines
      .find(l => l.startsWith('Birth:'))
      ?.replace('Birth: ', '')
    const death = lines
      .find(l => l.startsWith('Death:'))
      ?.replace('Death: ', '')

    let biography = `${name} was a remarkable individual whose life story is preserved in genealogical records. `

    if (birth) {
      biography += `Born ${birth}, `
    }

    if (death) {
      biography += `they lived until ${death}. `
    } else if (birth) {
      biography += `their life journey has been documented through various historical records. `
    }

    biography += `\n\nThis biography is generated from the available genealogical data. `
    biography += `To generate a more detailed and personalized biography, configure an AI API key in the system settings. `
    biography += `\n\n[Note: This is a placeholder biography. Configure OPENAI_API_KEY to enable AI-powered biography generation.]`

    return biography
  }

  /**
   * Save generated biography to person's profile
   */
  private async saveBiography(handle: string, biography: string) {
    const person = await this.prisma.person.findUnique({
      where: {handle},
    })

    if (!person) {
      throw new NotFoundException(`Person with handle ${handle} not found`)
    }

    const profile = person.profile ? JSON.parse(person.profile) : {}
    profile.biography = {
      text: biography,
      generatedAt: new Date().toISOString(),
      style: 'narrative',
    }

    await this.prisma.person.update({
      where: {handle},
      data: {
        profile: JSON.stringify(profile),
      },
    })
  }
}
