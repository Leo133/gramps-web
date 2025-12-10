import {Test, TestingModule} from '@nestjs/testing'
import {NotFoundException} from '@nestjs/common'
import {SmartHintsService} from '../smart-hints.service'
import {PrismaService} from '../../../prisma/prisma.service'

describe('SmartHintsService', () => {
  let service: SmartHintsService
  let prismaService: PrismaService

  const mockPrismaService = {
    person: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    event: {
      findMany: jest.fn(),
    },
    family: {
      findMany: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmartHintsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    service = module.get<SmartHintsService>(SmartHintsService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getPersonHints', () => {
    it('should throw NotFoundException when person is not found', async () => {
      mockPrismaService.person.findUnique.mockResolvedValue(null)

      await expect(service.getPersonHints('invalid-handle')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should detect missing birth event', async () => {
      const mockPerson = {
        handle: 'person123',
        firstName: 'John',
        surname: 'Smith',
        birthDate: null,
        deathDate: null,
        gender: 1,
      }

      mockPrismaService.person.findUnique.mockResolvedValue(mockPerson)
      mockPrismaService.event.findMany.mockResolvedValue([])
      mockPrismaService.family.findMany
        .mockResolvedValueOnce([]) // familiesAsParent
        .mockResolvedValueOnce([]) // familiesAsChild

      const result = await service.getPersonHints('person123')

      expect(result.hintsCount).toBeGreaterThan(0)
      expect(result.hints.some(h => h.type === 'missing_birth')).toBe(true)
    })

    it('should detect birth after death error', async () => {
      const mockPerson = {
        handle: 'person123',
        firstName: 'John',
        surname: 'Smith',
        birthDate: '1920',
        deathDate: '1910',
        gender: 1,
      }

      mockPrismaService.person.findUnique.mockResolvedValue(mockPerson)
      mockPrismaService.event.findMany.mockResolvedValue([])
      mockPrismaService.family.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await service.getPersonHints('person123')

      expect(result.hints.some(h => h.type === 'birth_after_death')).toBe(true)
      const errorHint = result.hints.find(h => h.type === 'birth_after_death')
      expect(errorHint?.severity).toBe('error')
    })

    it('should detect unusual lifespan', async () => {
      const mockPerson = {
        handle: 'person123',
        firstName: 'John',
        surname: 'Smith',
        birthDate: '1800',
        deathDate: '1950', // 150 years
        gender: 1,
      }

      mockPrismaService.person.findUnique.mockResolvedValue(mockPerson)
      mockPrismaService.event.findMany.mockResolvedValue([])
      mockPrismaService.family.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await service.getPersonHints('person123')

      expect(result.hints.some(h => h.type === 'unusual_lifespan')).toBe(true)
    })

    it('should detect missing parents', async () => {
      const mockPerson = {
        handle: 'person123',
        firstName: 'John',
        surname: 'Smith',
        birthDate: '1850',
        gender: 1,
      }

      mockPrismaService.person.findUnique.mockResolvedValue(mockPerson)
      mockPrismaService.event.findMany.mockResolvedValue([])
      mockPrismaService.family.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]) // No familiesAsChild

      const result = await service.getPersonHints('person123')

      expect(result.hints.some(h => h.type === 'missing_parents')).toBe(true)
    })
  })

  describe('getDataQualityIssues', () => {
    it('should calculate completeness score', async () => {
      const mockPeople = [
        {
          handle: 'person1',
          firstName: 'John',
          surname: 'Smith',
          birthDate: '1850',
          deathDate: '1920',
        },
        {
          handle: 'person2',
          firstName: 'Jane',
          surname: 'Doe',
          birthDate: null,
          deathDate: null,
        },
      ]

      mockPrismaService.person.findMany.mockResolvedValue(mockPeople)

      const result = await service.getDataQualityIssues()

      expect(result.summary).toBeDefined()
      expect(result.summary.totalPeople).toBe(2)
      expect(result.summary.missingBirthDates).toBe(1)
      expect(result.summary.completenessScore).toBeGreaterThanOrEqual(0)
      expect(result.summary.completenessScore).toBeLessThanOrEqual(100)
    })

    it('should identify date inconsistencies', async () => {
      const mockPeople = [
        {
          handle: 'person1',
          firstName: 'John',
          surname: 'Smith',
          birthDate: '1920',
          deathDate: '1910', // Birth after death!
        },
      ]

      mockPrismaService.person.findMany.mockResolvedValue(mockPeople)

      const result = await service.getDataQualityIssues()

      expect(result.summary.dateInconsistencies).toBe(1)
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.issues[0].type).toBe('birth_after_death')
    })
  })
})
