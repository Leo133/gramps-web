import {Injectable} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'
const natural = require('natural')
const metaphone = natural.Metaphone.process
const soundex = natural.SoundEx.process
import {doubleMetaphone} from 'double-metaphone'

export interface SearchOptions {
  query: string
  entityTypes?: string[]
  phonetic?: boolean
  fuzzy?: boolean
  limit?: number
  offset?: number
}

export interface SearchResult {
  entityType: string
  entityId: string
  entityHandle: string
  content: string
  score: number
  matchType: 'exact' | 'fuzzy' | 'phonetic'
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  /**
   * Index an entity for searching
   */
  async indexEntity(
    entityType: string,
    entityId: string,
    entityHandle: string,
    content: string,
  ): Promise<void> {
    // Extract key terms for phonetic indexing
    const terms = content.toLowerCase().split(/\s+/)
    const nameTerms = terms.filter(t => t.length > 2)

    // Generate phonetic codes
    const soundexCodes = nameTerms.map(t => soundex(t)).filter(Boolean)
    const metaphoneCodes = nameTerms.map(t => metaphone(t)).filter(Boolean)
    const dmetaphoneCodes = nameTerms
      .map(t => doubleMetaphone(t)[0])
      .filter(Boolean)

    await this.prisma.searchIndex.upsert({
      where: {
        entityType_entityId: {
          entityType,
          entityId,
        },
      },
      update: {
        entityHandle,
        content,
        soundex: soundexCodes.join(' '),
        metaphone: metaphoneCodes.join(' '),
        dmetaphone: dmetaphoneCodes.join(' '),
        updatedAt: new Date(),
      },
      create: {
        entityType,
        entityId,
        entityHandle,
        content,
        soundex: soundexCodes.join(' '),
        metaphone: metaphoneCodes.join(' '),
        dmetaphone: dmetaphoneCodes.join(' '),
      },
    })
  }

  /**
   * Remove entity from search index
   */
  async removeFromIndex(entityType: string, entityId: string): Promise<void> {
    await this.prisma.searchIndex.deleteMany({
      where: {
        entityType,
        entityId,
      },
    })
  }

  /**
   * Advanced search with phonetic matching
   */
  async search(options: SearchOptions): Promise<{
    results: SearchResult[]
    total: number
  }> {
    const {
      query,
      entityTypes = [],
      phonetic = false,
      fuzzy = false,
      limit = 20,
      offset = 0,
    } = options

    const searchTerms = query.toLowerCase().trim().split(/\s+/)
    const results: SearchResult[] = []

    // Exact match search
    const exactMatches = await this.prisma.searchIndex.findMany({
      where: {
        AND: [
          entityTypes.length > 0 ? {entityType: {in: entityTypes}} : {},
          {
            content: {
              contains: query.toLowerCase(),
            },
          },
        ],
      },
      take: limit,
      skip: offset,
    })

    results.push(
      ...exactMatches.map(match => ({
        entityType: match.entityType,
        entityId: match.entityId,
        entityHandle: match.entityHandle,
        content: match.content,
        score: 1.0,
        matchType: 'exact' as const,
      })),
    )

    // Phonetic search
    if (phonetic && searchTerms.length > 0) {
      const phoneticCodes = {
        soundex: searchTerms.map(t => soundex(t)).filter(Boolean),
        metaphone: searchTerms.map(t => metaphone(t)).filter(Boolean),
        dmetaphone: searchTerms.map(t => doubleMetaphone(t)[0]).filter(Boolean),
      }

      const phoneticMatches = await this.prisma.searchIndex.findMany({
        where: {
          AND: [
            entityTypes.length > 0 ? {entityType: {in: entityTypes}} : {},
            {
              OR: [
                phoneticCodes.soundex.length > 0
                  ? {
                      soundex: {
                        contains: phoneticCodes.soundex[0],
                      },
                    }
                  : {},
                phoneticCodes.metaphone.length > 0
                  ? {
                      metaphone: {
                        contains: phoneticCodes.metaphone[0],
                      },
                    }
                  : {},
                phoneticCodes.dmetaphone.length > 0
                  ? {
                      dmetaphone: {
                        contains: phoneticCodes.dmetaphone[0],
                      },
                    }
                  : {},
              ].filter(clause => Object.keys(clause).length > 0),
            },
          ],
        },
        take: limit,
        skip: offset,
      })

      // Filter out results already in exact matches
      const exactHandles = new Set(exactMatches.map(m => m.entityHandle))
      const newPhoneticMatches = phoneticMatches.filter(
        m => !exactHandles.has(m.entityHandle),
      )

      results.push(
        ...newPhoneticMatches.map(match => ({
          entityType: match.entityType,
          entityId: match.entityId,
          entityHandle: match.entityHandle,
          content: match.content,
          score: 0.7,
          matchType: 'phonetic' as const,
        })),
      )
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score)

    return {
      results: results.slice(0, limit),
      total: results.length,
    }
  }

  /**
   * Reindex all entities of a given type
   */
  async reindexAll(entityType: string): Promise<number> {
    let count = 0

    switch (entityType) {
      case 'Person': {
        const people = await this.prisma.person.findMany()
        for (const person of people) {
          const content = [
            person.firstName,
            person.surname,
            person.callName,
            person.grampsId,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          await this.indexEntity('Person', person.id, person.handle, content)
          count++
        }
        break
      }
      case 'Family': {
        const families = await this.prisma.family.findMany()
        for (const family of families) {
          const content = family.grampsId.toLowerCase()
          await this.indexEntity('Family', family.id, family.handle, content)
          count++
        }
        break
      }
      case 'Place': {
        const places = await this.prisma.place.findMany()
        for (const place of places) {
          const content = [place.name, place.title, place.grampsId]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          await this.indexEntity('Place', place.id, place.handle, content)
          count++
        }
        break
      }
      case 'Source': {
        const sources = await this.prisma.source.findMany()
        for (const source of sources) {
          const content = [source.title, source.author, source.grampsId]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          await this.indexEntity('Source', source.id, source.handle, content)
          count++
        }
        break
      }
    }

    return count
  }

  /**
   * Get search statistics
   */
  async getStatistics(): Promise<{
    totalIndexed: number
    byEntityType: Record<string, number>
  }> {
    const total = await this.prisma.searchIndex.count()
    const grouped = await this.prisma.searchIndex.groupBy({
      by: ['entityType'],
      _count: true,
    })

    const byEntityType: Record<string, number> = {}
    grouped.forEach(g => {
      byEntityType[g.entityType] = g._count
    })

    return {
      totalIndexed: total,
      byEntityType,
    }
  }
}
