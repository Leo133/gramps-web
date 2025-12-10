import {Injectable} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

export interface QualityIssue {
  type: string
  severity: 'error' | 'warning' | 'info'
  message: string
  entityType?: string
  entityHandle?: string
  details?: any
}

export interface QualityMetrics {
  completeness: number
  consistency: number
  accuracy: number
  overall: number
}

@Injectable()
export class QualityCheckService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate completeness score for a person
   */
  private calculatePersonCompleteness(person: any): number {
    const fields = [
      person.firstName,
      person.surname,
      person.birthDate,
      person.birthPlace,
      person.gender !== 2, // Has defined gender
      person.deathDate,
      person.deathPlace,
    ]

    const filled = fields.filter(Boolean).length
    return filled / fields.length
  }

  /**
   * Check for age inconsistencies
   */
  private async checkAgeConsistency(person: any): Promise<QualityIssue[]> {
    const issues: QualityIssue[] = []

    // Check birth before death
    if (person.birthDate && person.deathDate) {
      try {
        const birthYear = this.extractYear(person.birthDate)
        const deathYear = this.extractYear(person.deathDate)

        if (birthYear && deathYear && birthYear > deathYear) {
          issues.push({
            type: 'date_order',
            severity: 'error',
            message: 'Birth date is after death date',
            entityType: 'Person',
            entityHandle: person.handle,
            details: {birthDate: person.birthDate, deathDate: person.deathDate},
          })
        }

        if (birthYear && deathYear) {
          const age = deathYear - birthYear
          if (age > 120) {
            issues.push({
              type: 'age_unusual',
              severity: 'warning',
              message: `Person lived to age ${age}, which is unusual`,
              entityType: 'Person',
              entityHandle: person.handle,
            })
          }
        }
      } catch (e) {
        // Ignore date parsing errors
      }
    }

    return issues
  }

  /**
   * Check family relationships for consistency
   */
  private async checkFamilyConsistency(family: any): Promise<QualityIssue[]> {
    const issues: QualityIssue[] = []

    if (!family.fatherHandle && !family.motherHandle) {
      issues.push({
        type: 'empty_family',
        severity: 'warning',
        message: 'Family has no parents',
        entityType: 'Family',
        entityHandle: family.handle,
      })
    }

    // Get children
    const childRefList = family.childRefList
      ? JSON.parse(family.childRefList)
      : []

    if (childRefList.length === 0) {
      issues.push({
        type: 'no_children',
        severity: 'info',
        message: 'Family has no children',
        entityType: 'Family',
        entityHandle: family.handle,
      })
    }

    return issues
  }

  /**
   * Extract year from a date string
   */
  private extractYear(dateStr: string): number | null {
    // Try to parse various date formats
    const yearMatch = dateStr.match(/\d{4}/)
    return yearMatch ? parseInt(yearMatch[0]) : null
  }

  /**
   * Run all quality checks for a person
   */
  async checkPersonQuality(personId: string): Promise<{
    metrics: QualityMetrics
    issues: QualityIssue[]
  }> {
    const person = await this.prisma.person.findUnique({
      where: {id: personId},
    })

    if (!person) {
      throw new Error('Person not found')
    }

    const issues: QualityIssue[] = []

    // Check completeness
    const completeness = this.calculatePersonCompleteness(person)
    if (completeness < 0.5) {
      issues.push({
        type: 'low_completeness',
        severity: 'warning',
        message: `Person record is only ${Math.round(completeness * 100)}% complete`,
        entityType: 'Person',
        entityHandle: person.handle,
      })
    }

    // Check age consistency
    const ageIssues = await this.checkAgeConsistency(person)
    issues.push(...ageIssues)

    // Calculate metrics
    const metrics: QualityMetrics = {
      completeness,
      consistency: ageIssues.length === 0 ? 1.0 : 0.7,
      accuracy: 1.0, // Would need external validation
      overall: (completeness + (ageIssues.length === 0 ? 1.0 : 0.7)) / 2,
    }

    // Store metrics
    await this.prisma.dataQualityMetric.upsert({
      where: {
        metricType_entityType_entityId: {
          metricType: 'overall',
          entityType: 'Person',
          entityId: personId,
        },
      },
      create: {
        metricType: 'overall',
        entityType: 'Person',
        entityId: personId,
        entityHandle: person.handle,
        score: metrics.overall,
        issues: JSON.stringify(issues),
      },
      update: {
        score: metrics.overall,
        issues: JSON.stringify(issues),
        lastCalculated: new Date(),
      },
    })

    return {metrics, issues}
  }

  /**
   * Get dashboard data
   */
  async getDashboard(): Promise<{
    overall: QualityMetrics
    issueCount: {errors: number; warnings: number; info: number}
    topIssues: QualityIssue[]
    recentlyChecked: number
  }> {
    const allMetrics = await this.prisma.dataQualityMetric.findMany({
      where: {metricType: 'overall'},
    })

    // Calculate overall metrics
    const avgCompleteness =
      allMetrics.length > 0
        ? allMetrics.reduce((sum, m) => sum + m.score, 0) / allMetrics.length
        : 0

    // Calculate consistency score based on ratio of error-free records
    const recordsWithErrors = allMetrics.filter(m => {
      if (!m.issues) return false
      const issues = JSON.parse(m.issues) as QualityIssue[]
      return issues.some(i => i.severity === 'error')
    }).length
    const consistencyScore =
      allMetrics.length > 0 ? 1.0 - recordsWithErrors / allMetrics.length : 0

    // Accuracy score (would need external validation in production)
    const accuracyScore = 0.9 // Placeholder - requires external data validation

    // Count issues by severity
    let errors = 0
    let warnings = 0
    let info = 0
    const allIssues: QualityIssue[] = []

    allMetrics.forEach(metric => {
      if (metric.issues) {
        const issues = JSON.parse(metric.issues) as QualityIssue[]
        allIssues.push(...issues)
        issues.forEach(issue => {
          if (issue.severity === 'error') errors++
          else if (issue.severity === 'warning') warnings++
          else if (issue.severity === 'info') info++
        })
      }
    })

    // Get top issues (first 10)
    const topIssues = allIssues
      .sort((a, b) => {
        const severityOrder = {error: 0, warning: 1, info: 2}
        return severityOrder[a.severity] - severityOrder[b.severity]
      })
      .slice(0, 10)

    return {
      overall: {
        completeness: avgCompleteness,
        consistency: consistencyScore,
        accuracy: accuracyScore,
        overall: (avgCompleteness + consistencyScore + accuracyScore) / 3,
      },
      issueCount: {errors, warnings, info},
      topIssues,
      recentlyChecked: allMetrics.length,
    }
  }

  /**
   * Find disconnected branches
   */
  async findDisconnectedBranches(): Promise<any[]> {
    // Get all people
    const allPeople = await this.prisma.person.findMany({
      select: {id: true, handle: true, firstName: true, surname: true},
    })

    // Get all families
    const allFamilies = await this.prisma.family.findMany({
      select: {fatherHandle: true, motherHandle: true, childRefList: true},
    })

    // Build a graph of connections
    const connected = new Set<string>()
    const queue: string[] = []

    // Start with first person (arbitrary root)
    if (allPeople.length > 0) {
      queue.push(allPeople[0].handle)
      connected.add(allPeople[0].handle)
    }

    // BFS to find all connected people
    while (queue.length > 0) {
      const currentHandle = queue.shift()!

      // Find families where this person is a parent or child
      for (const family of allFamilies) {
        const children = family.childRefList
          ? JSON.parse(family.childRefList).map((ref: any) => ref.ref)
          : []

        if (
          family.fatherHandle === currentHandle ||
          family.motherHandle === currentHandle ||
          children.includes(currentHandle)
        ) {
          // Add parents and children
          if (family.fatherHandle && !connected.has(family.fatherHandle)) {
            connected.add(family.fatherHandle)
            queue.push(family.fatherHandle)
          }
          if (family.motherHandle && !connected.has(family.motherHandle)) {
            connected.add(family.motherHandle)
            queue.push(family.motherHandle)
          }
          children.forEach((childHandle: string) => {
            if (!connected.has(childHandle)) {
              connected.add(childHandle)
              queue.push(childHandle)
            }
          })
        }
      }
    }

    // Find disconnected people
    const disconnected = allPeople.filter(p => !connected.has(p.handle))

    return disconnected
  }
}
