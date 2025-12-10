import {Injectable, NotFoundException} from '@nestjs/common'
import {PrismaService} from '../../prisma/prisma.service'

// Constants for data quality analysis
const LIKELY_DECEASED_AGE_THRESHOLD = 120
const MIN_PARENT_AGE = 13
const MAX_MOTHER_AGE = 60
const MAX_FATHER_AGE = 80

interface PersonHint {
  type: string
  severity: 'info' | 'warning' | 'error'
  message: string
  suggestion?: string
  data?: any
}

@Injectable()
export class SmartHintsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get smart hints for a specific person
   */
  async getPersonHints(handle: string) {
    const person = await this.prisma.person.findUnique({
      where: {handle},
    })

    if (!person) {
      throw new NotFoundException(`Person with handle ${handle} not found`)
    }

    const hints: PersonHint[] = []

    // Get events for this person
    const events = await this.prisma.event.findMany({
      where: {personHandle: handle},
    })

    // Get families
    const familiesAsParent = await this.prisma.family.findMany({
      where: {
        OR: [{fatherHandle: handle}, {motherHandle: handle}],
      },
    })

    const familiesAsChild = await this.prisma.family.findMany({
      where: {
        childRefList: {
          contains: handle,
        },
      },
    })

    // Check for missing birth event
    const hasBirth = events.some(e => e.type === 'Birth')
    if (!hasBirth && !person.birthDate) {
      hints.push({
        type: 'missing_birth',
        severity: 'warning',
        message: 'No birth event or date recorded',
        suggestion: 'Add a birth event or date to improve data completeness',
      })
    }

    // Check for missing death event (for likely deceased persons)
    const hasDeath = events.some(e => e.type === 'Death')
    if (!hasDeath && !person.deathDate && this.isLikelyDeceased(person)) {
      hints.push({
        type: 'missing_death',
        severity: 'info',
        message: 'Person may be deceased but no death event recorded',
        suggestion: 'Consider adding a death event if applicable',
      })
    }

    // Check for missing parents
    if (familiesAsChild.length === 0) {
      hints.push({
        type: 'missing_parents',
        severity: 'info',
        message: 'No parents recorded',
        suggestion: 'Link this person to their parents if known',
      })
    }

    // Check for age inconsistencies with children
    if (familiesAsParent.length > 0) {
      const ageHints = await this.checkParentChildAgeConsistency(
        person,
        familiesAsParent,
      )
      hints.push(...ageHints)
    }

    // Check for birth after death
    if (person.birthDate && person.deathDate) {
      if (this.compareDates(person.birthDate, person.deathDate) > 0) {
        hints.push({
          type: 'birth_after_death',
          severity: 'error',
          message: 'Birth date is after death date',
          suggestion: 'Review and correct the dates',
          data: {
            birthDate: person.birthDate,
            deathDate: person.deathDate,
          },
        })
      }
    }

    // Check for extremely long lifespan (>120 years)
    if (person.birthDate && person.deathDate) {
      const lifespan = this.calculateLifespan(
        person.birthDate,
        person.deathDate,
      )
      if (lifespan > LIKELY_DECEASED_AGE_THRESHOLD) {
        hints.push({
          type: 'unusual_lifespan',
          severity: 'warning',
          message: `Lifespan of ${lifespan} years is unusually long`,
          suggestion: 'Verify birth and death dates are correct',
          data: {
            lifespan,
            birthDate: person.birthDate,
            deathDate: person.deathDate,
          },
        })
      }
    }

    return {
      handle,
      personName: `${person.firstName || ''} ${person.surname || ''}`.trim(),
      hintsCount: hints.length,
      hints,
    }
  }

  /**
   * Get data quality issues across the entire tree
   */
  async getDataQualityIssues() {
    const people = await this.prisma.person.findMany()
    const issues = {
      missingBirthDates: 0,
      missingDeathDates: 0,
      missingParents: 0,
      dateInconsistencies: 0,
      unusualLifespans: 0,
      incompletePlaces: 0,
      totalPeople: people.length,
      issues: [] as any[],
    }

    for (const person of people) {
      // Missing birth dates
      if (!person.birthDate) {
        issues.missingBirthDates++
      }

      // Missing death dates for likely deceased
      if (!person.deathDate && this.isLikelyDeceased(person)) {
        issues.missingDeathDates++
      }

      // Check for date inconsistencies
      if (person.birthDate && person.deathDate) {
        if (this.compareDates(person.birthDate, person.deathDate) > 0) {
          issues.dateInconsistencies++
          issues.issues.push({
            personHandle: person.handle,
            personName:
              `${person.firstName || ''} ${person.surname || ''}`.trim(),
            type: 'birth_after_death',
            severity: 'error',
            message: 'Birth date is after death date',
          })
        }

        const lifespan = this.calculateLifespan(
          person.birthDate,
          person.deathDate,
        )
        if (lifespan > LIKELY_DECEASED_AGE_THRESHOLD) {
          issues.unusualLifespans++
          issues.issues.push({
            personHandle: person.handle,
            personName:
              `${person.firstName || ''} ${person.surname || ''}`.trim(),
            type: 'unusual_lifespan',
            severity: 'warning',
            message: `Lifespan of ${lifespan} years is unusually long`,
          })
        }
      }
    }

    // Calculate completeness score (0-100)
    const completenessScore = Math.round(
      ((people.length - issues.missingBirthDates - issues.dateInconsistencies) /
        people.length) *
        100,
    )

    return {
      summary: {
        totalPeople: issues.totalPeople,
        completenessScore,
        missingBirthDates: issues.missingBirthDates,
        missingDeathDates: issues.missingDeathDates,
        dateInconsistencies: issues.dateInconsistencies,
        unusualLifespans: issues.unusualLifespans,
      },
      issues: issues.issues.slice(0, 50), // Return top 50 issues
    }
  }

  /**
   * Check if a person is likely deceased (born more than 120 years ago)
   */
  private isLikelyDeceased(person: any): boolean {
    if (!person.birthDate) return false

    try {
      const birthYear = this.extractYear(person.birthDate)
      const currentYear = new Date().getFullYear()
      return currentYear - birthYear > LIKELY_DECEASED_AGE_THRESHOLD
    } catch {
      return false
    }
  }

  /**
   * Check parent-child age consistency
   */
  private async checkParentChildAgeConsistency(
    person: any,
    families: any[],
  ): Promise<PersonHint[]> {
    const hints: PersonHint[] = []

    for (const family of families) {
      if (family.childRefList) {
        const childHandles = JSON.parse(family.childRefList)

        for (const childHandle of childHandles) {
          const child = await this.prisma.person.findUnique({
            where: {handle: childHandle},
          })

          if (child && person.birthDate && child.birthDate) {
            const parentBirthYear = this.extractYear(person.birthDate)
            const childBirthYear = this.extractYear(child.birthDate)
            const ageAtChildBirth = childBirthYear - parentBirthYear

            // Parent too young (< 13)
            if (ageAtChildBirth < MIN_PARENT_AGE) {
              hints.push({
                type: 'parent_too_young',
                severity: 'warning',
                message: `Parent was only ${ageAtChildBirth} years old at child's birth`,
                suggestion: 'Verify birth dates are correct',
                data: {
                  childHandle: child.handle,
                  childName:
                    `${child.firstName || ''} ${child.surname || ''}`.trim(),
                  ageAtBirth: ageAtChildBirth,
                },
              })
            }

            // Parent too old (> 60 for women, > 80 for men)
            const maxAge = person.gender === 0 ? MAX_MOTHER_AGE : MAX_FATHER_AGE
            if (ageAtChildBirth > maxAge) {
              hints.push({
                type: 'parent_too_old',
                severity: 'warning',
                message: `Parent was ${ageAtChildBirth} years old at child's birth`,
                suggestion: 'Verify birth dates are correct',
                data: {
                  childHandle: child.handle,
                  childName:
                    `${child.firstName || ''} ${child.surname || ''}`.trim(),
                  ageAtBirth: ageAtChildBirth,
                },
              })
            }
          }
        }
      }
    }

    return hints
  }

  /**
   * Compare two date strings
   * Returns: <0 if date1 < date2, 0 if equal, >0 if date1 > date2
   */
  private compareDates(date1: string, date2: string): number {
    const year1 = this.extractYear(date1)
    const year2 = this.extractYear(date2)
    return year1 - year2
  }

  /**
   * Calculate lifespan in years
   */
  private calculateLifespan(birthDate: string, deathDate: string): number {
    const birthYear = this.extractYear(birthDate)
    const deathYear = this.extractYear(deathDate)
    return deathYear - birthYear
  }

  /**
   * Extract year from a date string
   */
  private extractYear(dateString: string): number {
    // Try to extract year from various date formats
    const match = dateString.match(/\d{4}/)
    if (match) {
      return parseInt(match[0], 10)
    }
    throw new Error(`Could not extract year from date: ${dateString}`)
  }
}
