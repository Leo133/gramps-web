import {Test, TestingModule} from '@nestjs/testing'
import {ConfigService} from '@nestjs/config'
import {NotFoundException} from '@nestjs/common'
import {BiographyService} from '../biography.service'
import {PrismaService} from '../../../prisma/prisma.service'
import {GenerateBiographyDto, BiographyStyle} from '../../dto/generate-biography.dto'

describe('BiographyService', () => {
  let service: BiographyService
  let prismaService: PrismaService
  let configService: ConfigService

  const mockPrismaService = {
    person: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    event: {
      findMany: jest.fn(),
    },
    family: {
      findMany: jest.fn(),
    },
  }

  const mockConfigService = {
    get: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BiographyService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<BiographyService>(BiographyService)
    prismaService = module.get<PrismaService>(PrismaService)
    configService = module.get<ConfigService>(ConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('generateBiography', () => {
    it('should throw NotFoundException when person is not found', async () => {
      mockPrismaService.person.findUnique.mockResolvedValue(null)

      const dto: GenerateBiographyDto = {
        style: BiographyStyle.NARRATIVE,
        length: 500,
      }

      await expect(service.generateBiography('invalid-handle', dto)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should generate a mock biography when no API key is configured', async () => {
      const mockPerson = {
        handle: 'person123',
        firstName: 'John',
        surname: 'Smith',
        birthDate: '1850-01-01',
        deathDate: '1920-12-31',
        profile: null,
      }

      mockPrismaService.person.findUnique.mockResolvedValue(mockPerson)
      mockPrismaService.event.findMany.mockResolvedValue([])
      mockPrismaService.family.findMany.mockResolvedValue([])
      mockPrismaService.person.update.mockResolvedValue(mockPerson)
      mockConfigService.get.mockReturnValue(null) // No API key

      const dto: GenerateBiographyDto = {
        style: BiographyStyle.NARRATIVE,
        length: 500,
      }

      const result = await service.generateBiography('person123', dto)

      expect(result).toBeDefined()
      expect(result.handle).toBe('person123')
      expect(result.biography).toContain('John Smith')
      expect(result.wordCount).toBeGreaterThan(0)
    })

    it('should include events in the biography context when requested', async () => {
      const mockPerson = {
        handle: 'person123',
        firstName: 'John',
        surname: 'Smith',
        birthDate: '1850-01-01',
        profile: null,
      }

      const mockEvents = [
        {
          type: 'Birth',
          date: '1850-01-01',
          place: 'New York',
        },
      ]

      mockPrismaService.person.findUnique.mockResolvedValue(mockPerson)
      mockPrismaService.event.findMany.mockResolvedValue(mockEvents)
      mockPrismaService.family.findMany.mockResolvedValue([])
      mockPrismaService.person.update.mockResolvedValue(mockPerson)
      mockConfigService.get.mockReturnValue(null)

      const dto: GenerateBiographyDto = {
        style: BiographyStyle.NARRATIVE,
        length: 500,
        includeEvents: true,
      }

      const result = await service.generateBiography('person123', dto)

      expect(result).toBeDefined()
      expect(mockPrismaService.event.findMany).toHaveBeenCalled()
    })
  })

  describe('getBiography', () => {
    it('should throw NotFoundException when person is not found', async () => {
      mockPrismaService.person.findUnique.mockResolvedValue(null)

      await expect(service.getBiography('invalid-handle')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should return null when no biography exists', async () => {
      const mockPerson = {
        handle: 'person123',
        firstName: 'John',
        surname: 'Smith',
        profile: null,
      }

      mockPrismaService.person.findUnique.mockResolvedValue(mockPerson)

      const result = await service.getBiography('person123')

      expect(result.biography).toBeNull()
      expect(result.message).toBe('No biography generated yet')
    })

    it('should return existing biography from profile', async () => {
      const mockBiography = {
        text: 'This is a test biography',
        generatedAt: '2025-12-10T00:00:00Z',
        style: 'narrative',
      }

      const mockPerson = {
        handle: 'person123',
        firstName: 'John',
        surname: 'Smith',
        profile: JSON.stringify({biography: mockBiography}),
      }

      mockPrismaService.person.findUnique.mockResolvedValue(mockPerson)

      const result = await service.getBiography('person123')

      expect(result.biography).toBe(mockBiography.text)
      expect(result.generatedAt).toBe(mockBiography.generatedAt)
    })
  })
})
