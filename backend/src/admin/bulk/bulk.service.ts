import {Injectable} from '@nestjs/common'
import {PrismaService} from '../../prisma/prisma.service'

@Injectable()
export class BulkService {
  constructor(private prisma: PrismaService) {}

  /**
   * Mass tag entities
   */
  async massTag(params: {
    entityType: 'person' | 'place' | 'source' | 'media'
    entityIds: string[]
    tags: string[]
    userId: string
  }) {
    const {entityType, entityIds, tags, userId} = params

    // This is a placeholder implementation
    // In a real implementation, we'd need a tags field in the schema
    const results = {
      entityType,
      affected: entityIds.length,
      tags,
      timestamp: new Date(),
    }

    // Log the bulk operation
    await this.logBulkOperation({
      userId,
      operation: 'MASS_TAG',
      entityType,
      affectedIds: entityIds,
      details: {tags},
    })

    return results
  }

  /**
   * Find and replace text in entities
   */
  async findAndReplace(params: {
    entityType: 'person' | 'place' | 'source' | 'note'
    field: string
    findText: string
    replaceText: string
    caseSensitive?: boolean
    wholeWord?: boolean
    userId: string
  }) {
    const {
      entityType,
      field,
      findText,
      replaceText,
      caseSensitive = false,
      wholeWord = false,
      userId,
    } = params

    let affected = 0
    const changes: any[] = []

    // Build regex pattern
    let pattern = findText
    if (!caseSensitive) {
      pattern = pattern.toLowerCase()
    }
    if (wholeWord) {
      pattern = `\\b${pattern}\\b`
    }

    const regex = new RegExp(pattern, caseSensitive ? 'g' : 'gi')

    // Handle different entity types
    switch (entityType) {
      case 'person':
        affected = await this.findReplaceInPeople(
          field,
          regex,
          replaceText,
          changes,
        )
        break
      case 'place':
        affected = await this.findReplaceInPlaces(
          field,
          regex,
          replaceText,
          changes,
        )
        break
      case 'source':
        affected = await this.findReplaceInSources(
          field,
          regex,
          replaceText,
          changes,
        )
        break
      case 'note':
        affected = await this.findReplaceInNotes(
          field,
          regex,
          replaceText,
          changes,
        )
        break
    }

    // Log the bulk operation
    await this.logBulkOperation({
      userId,
      operation: 'FIND_REPLACE',
      entityType,
      affectedIds: changes.map(c => c.id),
      details: {
        field,
        findText,
        replaceText,
        caseSensitive,
        wholeWord,
      },
    })

    return {
      affected,
      changes: changes.slice(0, 100), // Limit response size
      totalChanges: changes.length,
    }
  }

  /**
   * Merge duplicate entities
   */
  async mergeDuplicates(params: {
    entityType: 'person' | 'place' | 'source'
    primaryId: string
    duplicateIds: string[]
    strategy?: 'prefer-primary' | 'prefer-newest' | 'prefer-oldest'
    userId: string
  }) {
    const {
      entityType,
      primaryId,
      duplicateIds,
      strategy = 'prefer-primary',
      userId,
    } = params

    // Get the primary entity
    let primary: any
    const duplicates: any[] = []

    switch (entityType) {
      case 'person':
        primary = await this.prisma.person.findUnique({where: {id: primaryId}})
        for (const id of duplicateIds) {
          const dup = await this.prisma.person.findUnique({where: {id}})
          if (dup) duplicates.push(dup)
        }
        break
      case 'place':
        primary = await this.prisma.place.findUnique({where: {id: primaryId}})
        for (const id of duplicateIds) {
          const dup = await this.prisma.place.findUnique({where: {id}})
          if (dup) duplicates.push(dup)
        }
        break
      case 'source':
        primary = await this.prisma.source.findUnique({where: {id: primaryId}})
        for (const id of duplicateIds) {
          const dup = await this.prisma.source.findUnique({where: {id}})
          if (dup) duplicates.push(dup)
        }
        break
    }

    if (!primary) {
      throw new Error('Primary entity not found')
    }

    // Merge data based on strategy
    const merged = this.mergeEntityData(primary, duplicates, strategy)

    // Update the primary entity with merged data
    let updated: any
    switch (entityType) {
      case 'person':
        updated = await this.prisma.person.update({
          where: {id: primaryId},
          data: merged,
        })
        // Delete duplicates
        await this.prisma.person.deleteMany({
          where: {id: {in: duplicateIds}},
        })
        break
      case 'place':
        updated = await this.prisma.place.update({
          where: {id: primaryId},
          data: merged,
        })
        await this.prisma.place.deleteMany({
          where: {id: {in: duplicateIds}},
        })
        break
      case 'source':
        updated = await this.prisma.source.update({
          where: {id: primaryId},
          data: merged,
        })
        await this.prisma.source.deleteMany({
          where: {id: {in: duplicateIds}},
        })
        break
    }

    // Log the bulk operation
    await this.logBulkOperation({
      userId,
      operation: 'MERGE',
      entityType,
      affectedIds: [primaryId, ...duplicateIds],
      details: {
        primaryId,
        duplicateIds,
        strategy,
      },
    })

    return {
      success: true,
      primaryId,
      merged: updated,
      deletedCount: duplicateIds.length,
    }
  }

  /**
   * Find potential duplicates
   */
  async findDuplicates(params: {
    entityType: 'person' | 'place' | 'source'
    threshold?: number
  }) {
    const {entityType, threshold = 0.8} = params

    // This is a simplified implementation
    // A real implementation would use more sophisticated matching algorithms
    const duplicates: any[] = []

    switch (entityType) {
      case 'person':
        duplicates.push(...(await this.findDuplicatePeople(threshold)))
        break
      case 'place':
        duplicates.push(...(await this.findDuplicatePlaces(threshold)))
        break
      case 'source':
        duplicates.push(...(await this.findDuplicateSources(threshold)))
        break
    }

    return {
      entityType,
      duplicates,
      count: duplicates.length,
    }
  }

  /**
   * Helper: Find and replace in people
   */
  private async findReplaceInPeople(
    field: string,
    regex: RegExp,
    replaceText: string,
    changes: any[],
  ) {
    let affected = 0
    const validFields = ['firstName', 'surname', 'callName']

    if (!validFields.includes(field)) {
      throw new Error(`Invalid field: ${field}`)
    }

    const people = await this.prisma.person.findMany()

    for (const person of people) {
      const oldValue = person[field as keyof typeof person]
      if (oldValue && typeof oldValue === 'string' && regex.test(oldValue)) {
        const newValue = oldValue.replace(regex, replaceText)
        await this.prisma.person.update({
          where: {id: person.id},
          data: {[field]: newValue},
        })
        changes.push({id: person.id, field, oldValue, newValue})
        affected++
      }
    }

    return affected
  }

  /**
   * Helper: Find and replace in places
   */
  private async findReplaceInPlaces(
    field: string,
    regex: RegExp,
    replaceText: string,
    changes: any[],
  ) {
    let affected = 0
    const validFields = ['name', 'title']

    if (!validFields.includes(field)) {
      throw new Error(`Invalid field: ${field}`)
    }

    const places = await this.prisma.place.findMany()

    for (const place of places) {
      const oldValue = place[field as keyof typeof place]
      if (oldValue && typeof oldValue === 'string' && regex.test(oldValue)) {
        const newValue = oldValue.replace(regex, replaceText)
        await this.prisma.place.update({
          where: {id: place.id},
          data: {[field]: newValue},
        })
        changes.push({id: place.id, field, oldValue, newValue})
        affected++
      }
    }

    return affected
  }

  /**
   * Helper: Find and replace in sources
   */
  private async findReplaceInSources(
    field: string,
    regex: RegExp,
    replaceText: string,
    changes: any[],
  ) {
    let affected = 0
    const validFields = ['title', 'author', 'pubInfo']

    if (!validFields.includes(field)) {
      throw new Error(`Invalid field: ${field}`)
    }

    const sources = await this.prisma.source.findMany()

    for (const source of sources) {
      const oldValue = source[field as keyof typeof source]
      if (oldValue && typeof oldValue === 'string' && regex.test(oldValue)) {
        const newValue = oldValue.replace(regex, replaceText)
        await this.prisma.source.update({
          where: {id: source.id},
          data: {[field]: newValue},
        })
        changes.push({id: source.id, field, oldValue, newValue})
        affected++
      }
    }

    return affected
  }

  /**
   * Helper: Find and replace in notes
   */
  private async findReplaceInNotes(
    field: string,
    regex: RegExp,
    replaceText: string,
    changes: any[],
  ) {
    let affected = 0

    if (field !== 'content') {
      throw new Error(`Invalid field: ${field}`)
    }

    const notes = await this.prisma.note.findMany()

    for (const note of notes) {
      const oldValue = note.content
      if (oldValue && regex.test(oldValue)) {
        const newValue = oldValue.replace(regex, replaceText)
        await this.prisma.note.update({
          where: {id: note.id},
          data: {content: newValue},
        })
        changes.push({id: note.id, field, oldValue, newValue})
        affected++
      }
    }

    return affected
  }

  /**
   * Helper: Merge entity data
   */
  private mergeEntityData(primary: any, duplicates: any[], strategy: string) {
    const merged = {...primary}

    for (const dup of duplicates) {
      for (const key in dup) {
        if (key === 'id' || key === 'handle' || key === 'grampsId') continue

        if (!merged[key] && dup[key]) {
          merged[key] = dup[key]
        } else if (
          strategy === 'prefer-newest' &&
          dup.updatedAt > merged.updatedAt
        ) {
          merged[key] = dup[key]
        } else if (
          strategy === 'prefer-oldest' &&
          dup.createdAt < merged.createdAt
        ) {
          merged[key] = dup[key]
        }
      }
    }

    delete merged.id
    delete merged.handle
    delete merged.grampsId
    delete merged.createdAt
    delete merged.updatedAt

    return merged
  }

  /**
   * Helper: Find duplicate people
   */
  private async findDuplicatePeople(threshold: number) {
    const people = await this.prisma.person.findMany()
    const duplicates: any[] = []

    for (let i = 0; i < people.length; i++) {
      for (let j = i + 1; j < people.length; j++) {
        const similarity = this.calculatePersonSimilarity(people[i], people[j])
        if (similarity >= threshold) {
          duplicates.push({
            entities: [people[i], people[j]],
            similarity,
          })
        }
      }
    }

    return duplicates
  }

  /**
   * Helper: Find duplicate places
   */
  private async findDuplicatePlaces(threshold: number) {
    const places = await this.prisma.place.findMany()
    const duplicates: any[] = []

    for (let i = 0; i < places.length; i++) {
      for (let j = i + 1; j < places.length; j++) {
        const similarity = this.calculatePlaceSimilarity(places[i], places[j])
        if (similarity >= threshold) {
          duplicates.push({
            entities: [places[i], places[j]],
            similarity,
          })
        }
      }
    }

    return duplicates
  }

  /**
   * Helper: Find duplicate sources
   */
  private async findDuplicateSources(threshold: number) {
    const sources = await this.prisma.source.findMany()
    const duplicates: any[] = []

    for (let i = 0; i < sources.length; i++) {
      for (let j = i + 1; j < sources.length; j++) {
        const similarity = this.calculateSourceSimilarity(
          sources[i],
          sources[j],
        )
        if (similarity >= threshold) {
          duplicates.push({
            entities: [sources[i], sources[j]],
            similarity,
          })
        }
      }
    }

    return duplicates
  }

  /**
   * Helper: Calculate person similarity
   */
  private calculatePersonSimilarity(p1: any, p2: any): number {
    let score = 0
    let checks = 0

    if (p1.firstName && p2.firstName) {
      checks++
      if (p1.firstName.toLowerCase() === p2.firstName.toLowerCase()) score++
    }

    if (p1.surname && p2.surname) {
      checks++
      if (p1.surname.toLowerCase() === p2.surname.toLowerCase()) score++
    }

    if (p1.birthDate && p2.birthDate) {
      checks++
      if (p1.birthDate === p2.birthDate) score++
    }

    if (p1.birthPlace && p2.birthPlace) {
      checks++
      if (p1.birthPlace.toLowerCase() === p2.birthPlace.toLowerCase()) score++
    }

    return checks > 0 ? score / checks : 0
  }

  /**
   * Helper: Calculate place similarity
   */
  private calculatePlaceSimilarity(p1: any, p2: any): number {
    let score = 0
    let checks = 0

    if (p1.name && p2.name) {
      checks++
      if (p1.name.toLowerCase() === p2.name.toLowerCase()) score++
    }

    if (p1.latitude && p2.latitude && p1.longitude && p2.longitude) {
      checks++
      const distance = Math.sqrt(
        Math.pow(p1.latitude - p2.latitude, 2) +
          Math.pow(p1.longitude - p2.longitude, 2),
      )
      if (distance < 0.001) score++ // Very close coordinates
    }

    return checks > 0 ? score / checks : 0
  }

  /**
   * Helper: Calculate source similarity
   */
  private calculateSourceSimilarity(s1: any, s2: any): number {
    let score = 0
    let checks = 0

    if (s1.title && s2.title) {
      checks++
      if (s1.title.toLowerCase() === s2.title.toLowerCase()) score++
    }

    if (s1.author && s2.author) {
      checks++
      if (s1.author.toLowerCase() === s2.author.toLowerCase()) score++
    }

    return checks > 0 ? score / checks : 0
  }

  /**
   * Helper: Log bulk operation to audit log
   */
  private async logBulkOperation(data: {
    userId: string
    operation: string
    entityType: string
    affectedIds: string[]
    details: any
  }) {
    // Create a single audit log entry for the bulk operation
    await this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: `BULK_${data.operation}`,
        entityType: data.entityType,
        entityId: 'BULK_OPERATION',
        changes: JSON.stringify({
          affectedIds: data.affectedIds,
          count: data.affectedIds.length,
          ...data.details,
        }),
      },
    })
  }
}
