import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
const stringSimilarity = require('string-similarity');
const compareTwoStrings = stringSimilarity.compareTwoStrings;

@Injectable()
export class DuplicatesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find potential duplicate people
   */
  async findDuplicatePeople(minSimilarity: number = 0.7): Promise<any[]> {
    const people = await this.prisma.person.findMany();
    const suggestions = [];

    // Compare all pairs of people
    for (let i = 0; i < people.length; i++) {
      for (let j = i + 1; j < people.length; j++) {
        const person1 = people[i];
        const person2 = people[j];

        const matchReasons = [];
        let totalScore = 0;
        let scoreCount = 0;

        // Compare names
        const name1 = `${person1.firstName || ''} ${person1.surname || ''}`.trim();
        const name2 = `${person2.firstName || ''} ${person2.surname || ''}`.trim();
        
        if (name1 && name2) {
          const nameSimilarity = compareTwoStrings(
            name1.toLowerCase(),
            name2.toLowerCase(),
          );
          
          if (nameSimilarity > minSimilarity) {
            matchReasons.push({
              type: 'name',
              score: nameSimilarity,
              details: { name1, name2 },
            });
            totalScore += nameSimilarity;
            scoreCount++;
          }
        }

        // Compare birth dates
        if (person1.birthDate && person2.birthDate) {
          if (person1.birthDate === person2.birthDate) {
            matchReasons.push({
              type: 'birth_date',
              score: 1.0,
              details: { date: person1.birthDate },
            });
            totalScore += 1.0;
            scoreCount++;
          }
        }

        // Compare birth places
        if (person1.birthPlace && person2.birthPlace) {
          const placeSimilarity = compareTwoStrings(
            person1.birthPlace.toLowerCase(),
            person2.birthPlace.toLowerCase(),
          );
          
          if (placeSimilarity > 0.8) {
            matchReasons.push({
              type: 'birth_place',
              score: placeSimilarity,
              details: { place1: person1.birthPlace, place2: person2.birthPlace },
            });
            totalScore += placeSimilarity;
            scoreCount++;
          }
        }

        // If we found matches, create a suggestion
        if (matchReasons.length > 0) {
          const avgScore = totalScore / scoreCount;
          
          if (avgScore >= minSimilarity) {
            suggestions.push({
              entityType: 'Person',
              entity1: {
                handle: person1.handle,
                name: name1,
                birthDate: person1.birthDate,
                birthPlace: person1.birthPlace,
              },
              entity2: {
                handle: person2.handle,
                name: name2,
                birthDate: person2.birthDate,
                birthPlace: person2.birthPlace,
              },
              similarityScore: avgScore,
              matchReasons,
            });

            // Store in database
            await this.prisma.duplicateSuggestion.create({
              data: {
                entityType: 'Person',
                entity1Handle: person1.handle,
                entity2Handle: person2.handle,
                similarityScore: avgScore,
                matchReasons: JSON.stringify(matchReasons),
                status: 'pending',
              },
            });
          }
        }
      }
    }

    return suggestions;
  }

  /**
   * Get pending duplicate suggestions
   */
  async getPendingSuggestions(entityType?: string): Promise<any[]> {
    const suggestions = await this.prisma.duplicateSuggestion.findMany({
      where: {
        status: 'pending',
        ...(entityType ? { entityType } : {}),
      },
      orderBy: {
        similarityScore: 'desc',
      },
    });

    return suggestions.map(s => ({
      id: s.id,
      entityType: s.entityType,
      entity1Handle: s.entity1Handle,
      entity2Handle: s.entity2Handle,
      similarityScore: s.similarityScore,
      matchReasons: JSON.parse(s.matchReasons),
      status: s.status,
      createdAt: s.createdAt,
    }));
  }

  /**
   * Update suggestion status
   */
  async updateSuggestionStatus(
    id: string,
    status: 'merged' | 'dismissed',
    userId: string,
  ): Promise<any> {
    return this.prisma.duplicateSuggestion.update({
      where: { id },
      data: {
        status,
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
    });
  }

  /**
   * Merge two people (not yet implemented)
   * 
   * This is a complex operation that requires:
   * 1. Combining all data from both records
   * 2. Updating all references (families, events, media, etc.)
   * 3. Handling conflicts in data
   * 4. Preserving audit trail
   * 5. Deleting the duplicate record
   * 
   * @throws Error indicating feature is not yet available
   * @returns Never - always throws an error
   */
  async mergePeople(handle1: string, handle2: string, keepHandle: string): Promise<any> {
    throw new Error(
      'Merge functionality is not yet implemented. ' +
      'This is a complex operation that requires careful handling of all ' +
      'entity relationships. Please manually merge records for now.'
    );
  }
}
