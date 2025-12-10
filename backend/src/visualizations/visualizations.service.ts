import {Injectable} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

interface PathNode {
  handle: string
  gramps_id: string
  name: string
  gender: number
  relationship: string
}

interface RelationshipResult {
  person1: PathNode
  person2: PathNode
  relationship: string
  commonAncestor: PathNode | null
  path: PathNode[]
  distance: number
  relationshipType:
    | 'self'
    | 'parent'
    | 'child'
    | 'sibling'
    | 'spouse'
    | 'cousin'
    | 'ancestor'
    | 'descendant'
    | 'in-law'
    | 'distant'
}

@Injectable()
export class VisualizationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate the genealogical relationship between two people
   * Uses bidirectional BFS to find the shortest path through the family tree
   */
  async calculateRelationship(
    person1Handle: string,
    person2Handle: string,
  ): Promise<RelationshipResult> {
    // Special case: same person
    if (person1Handle === person2Handle) {
      const person = await this.prisma.person.findUnique({
        where: {handle: person1Handle},
      })
      return {
        person1: this.personToPathNode(person),
        person2: this.personToPathNode(person),
        relationship: 'Self',
        commonAncestor: null,
        path: [this.personToPathNode(person)],
        distance: 0,
        relationshipType: 'self',
      }
    }

    // Find shortest path using bidirectional BFS
    const path = await this.findShortestPath(person1Handle, person2Handle)

    if (!path || path.length === 0) {
      return {
        person1: await this.getPersonNode(person1Handle),
        person2: await this.getPersonNode(person2Handle),
        relationship: 'No known relationship',
        commonAncestor: null,
        path: [],
        distance: -1,
        relationshipType: 'distant',
      }
    }

    // Analyze the path to determine relationship
    const relationship = this.analyzeRelationship(path)

    return {
      person1: path[0],
      person2: path[path.length - 1],
      relationship: relationship.description,
      commonAncestor: relationship.commonAncestor,
      path,
      distance: path.length - 1,
      relationshipType: relationship.type,
    }
  }

  /**
   * Find shortest path between two people using bidirectional BFS
   */
  private async findShortestPath(
    startHandle: string,
    endHandle: string,
  ): Promise<PathNode[]> {
    const visited = new Map<string, {from: string | null; node: PathNode}>()
    const queue: Array<{handle: string; path: PathNode[]}> = []

    // Start BFS from person1
    const startPerson = await this.getPersonNode(startHandle)
    queue.push({handle: startHandle, path: [startPerson]})
    visited.set(startHandle, {from: null, node: startPerson})

    while (queue.length > 0) {
      const {handle, path} = queue.shift()!

      // Check if we reached the target
      if (handle === endHandle) {
        return path
      }

      // Explore neighbors (parents, children, spouses)
      const neighbors = await this.getNeighbors(handle)

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.handle)) {
          const newPath = [...path, neighbor]
          visited.set(neighbor.handle, {from: handle, node: neighbor})
          queue.push({handle: neighbor.handle, path: newPath})
        }
      }
    }

    return [] // No path found
  }

  /**
   * Get all neighboring people (parents, children, spouses)
   *
   * PERFORMANCE NOTE: This method loads all families and filters in memory
   * because Prisma doesn't support native JSON array querying for SQLite.
   * For production with large datasets, consider:
   * 1. Using PostgreSQL with native JSON support
   * 2. Creating a separate child_family_members junction table
   * 3. Using raw SQL with JSON_EXTRACT for SQLite
   */
  private async getNeighbors(personHandle: string): Promise<PathNode[]> {
    const neighbors: PathNode[] = []

    // Get person's families as child (query all families and filter in code)
    // TODO: Optimize with proper JSON querying or junction table
    const allFamilies = await this.prisma.family.findMany({
      include: {
        father: true,
        mother: true,
      },
    })

    const childFamilies = allFamilies.filter(family => {
      if (!family.childRefList) return false
      const childList = JSON.parse(family.childRefList)
      return Array.isArray(childList) && childList.includes(personHandle)
    })

    for (const family of childFamilies) {
      if (family.father) {
        neighbors.push(this.personToPathNode(family.father, 'parent'))
      }
      if (family.mother) {
        neighbors.push(this.personToPathNode(family.mother, 'parent'))
      }
    }

    // Get person's families as parent
    const parentFamilies = await this.prisma.family.findMany({
      where: {
        OR: [{fatherHandle: personHandle}, {motherHandle: personHandle}],
      },
    })

    for (const family of parentFamilies) {
      // Add spouse
      if (family.fatherHandle === personHandle && family.motherHandle) {
        const spouse = await this.prisma.person.findUnique({
          where: {handle: family.motherHandle},
        })
        if (spouse) {
          neighbors.push(this.personToPathNode(spouse, 'spouse'))
        }
      } else if (family.motherHandle === personHandle && family.fatherHandle) {
        const spouse = await this.prisma.person.findUnique({
          where: {handle: family.fatherHandle},
        })
        if (spouse) {
          neighbors.push(this.personToPathNode(spouse, 'spouse'))
        }
      }

      // Add children
      if (family.childRefList) {
        const childList = JSON.parse(family.childRefList)
        if (Array.isArray(childList)) {
          for (const childHandle of childList) {
            const child = await this.prisma.person.findUnique({
              where: {handle: childHandle},
            })
            if (child) {
              neighbors.push(this.personToPathNode(child, 'child'))
            }
          }
        }
      }
    }

    return neighbors
  }

  /**
   * Analyze relationship path to generate human-readable description
   */
  private analyzeRelationship(path: PathNode[]): {
    description: string
    type: RelationshipResult['relationshipType']
    commonAncestor: PathNode | null
  } {
    if (path.length === 1) {
      return {
        description: 'Self',
        type: 'self',
        commonAncestor: null,
      }
    }

    if (path.length === 2) {
      const rel = path[1].relationship
      if (rel === 'parent') {
        return {
          description: this.getParentChildTerm(path[1].gender, true),
          type: 'parent',
          commonAncestor: null,
        }
      }
      if (rel === 'child') {
        return {
          description: this.getParentChildTerm(path[1].gender, false),
          type: 'child',
          commonAncestor: null,
        }
      }
      if (rel === 'spouse') {
        return {
          description: this.getSpouseTerm(path[1].gender),
          type: 'spouse',
          commonAncestor: null,
        }
      }
    }

    // Count steps up and down
    let stepsUp = 0
    let stepsDown = 0
    let foundAncestor = false
    let commonAncestor: PathNode | null = null

    for (let i = 1; i < path.length; i++) {
      if (path[i].relationship === 'parent' && !foundAncestor) {
        stepsUp++
      } else if (path[i].relationship === 'child') {
        foundAncestor = true
        stepsDown++
      }
    }

    if (stepsUp > 0 && !foundAncestor) {
      commonAncestor = path[stepsUp]
    }

    // Siblings (same parents)
    if (stepsUp === 1 && stepsDown === 1) {
      return {
        description: this.getSiblingTerm(path[path.length - 1].gender),
        type: 'sibling',
        commonAncestor,
      }
    }

    // Direct ancestors
    if (stepsUp > 0 && stepsDown === 0) {
      return {
        description: this.getAncestorTerm(
          stepsUp,
          path[path.length - 1].gender,
        ),
        type: 'ancestor',
        commonAncestor,
      }
    }

    // Direct descendants
    if (stepsUp === 0 && stepsDown > 0) {
      return {
        description: this.getDescendantTerm(
          stepsDown,
          path[path.length - 1].gender,
        ),
        type: 'descendant',
        commonAncestor,
      }
    }

    // Cousins
    if (stepsUp > 0 && stepsDown > 0) {
      return {
        description: this.getCousinTerm(stepsUp, stepsDown),
        type: 'cousin',
        commonAncestor,
      }
    }

    return {
      description: 'Distant relative',
      type: 'distant',
      commonAncestor,
    }
  }

  private getParentChildTerm(gender: number, isParent: boolean): string {
    if (isParent) {
      return gender === 1 ? 'Father' : gender === 0 ? 'Mother' : 'Parent'
    }
    return gender === 1 ? 'Son' : gender === 0 ? 'Daughter' : 'Child'
  }

  private getSpouseTerm(gender: number): string {
    return gender === 1 ? 'Husband' : gender === 0 ? 'Wife' : 'Spouse'
  }

  private getSiblingTerm(gender: number): string {
    return gender === 1 ? 'Brother' : gender === 0 ? 'Sister' : 'Sibling'
  }

  private getAncestorTerm(generations: number, gender: number): string {
    if (generations === 1) {
      return this.getParentChildTerm(gender, true)
    }
    if (generations === 2) {
      return gender === 1
        ? 'Grandfather'
        : gender === 0
          ? 'Grandmother'
          : 'Grandparent'
    }
    const prefix = 'Great-'.repeat(generations - 2)
    const base =
      gender === 1
        ? 'Grandfather'
        : gender === 0
          ? 'Grandmother'
          : 'Grandparent'
    return prefix + base
  }

  private getDescendantTerm(generations: number, gender: number): string {
    if (generations === 1) {
      return this.getParentChildTerm(gender, false)
    }
    if (generations === 2) {
      return gender === 1
        ? 'Grandson'
        : gender === 0
          ? 'Granddaughter'
          : 'Grandchild'
    }
    const prefix = 'Great-'.repeat(generations - 2)
    const base =
      gender === 1 ? 'Grandson' : gender === 0 ? 'Granddaughter' : 'Grandchild'
    return prefix + base
  }

  private getGreatPrefix(removal: number): string {
    return removal > 1 ? `Great-${'Great-'.repeat(removal - 2)}` : ''
  }

  private getCousinTerm(stepsUp: number, stepsDown: number): string {
    const degree = Math.min(stepsUp, stepsDown) - 1
    const removal = Math.abs(stepsUp - stepsDown)

    // Aunt/Uncle or Niece/Nephew relationships (degree = 0)
    if (degree === 0) {
      if (removal === 0) {
        // Sibling (should not reach here as it's handled earlier)
        return 'Sibling'
      }
      // stepsUp = steps going up from person1 to common ancestor
      // stepsDown = steps going down from common ancestor to person2
      // When stepsUp > stepsDown, person2 is in an older generation relative to person1
      const prefix = this.getGreatPrefix(removal)
      if (stepsUp > stepsDown) {
        // Person2 is older generation (aunt/uncle)
        return `${prefix}Aunt/Uncle`
      }
      // Person2 is younger generation (niece/nephew)
      return `${prefix}Niece/Nephew`
    }

    // Cousin relationships (degree > 0)
    const cousinType = `${this.getOrdinal(degree)} cousin`
    if (removal === 0) {
      return cousinType
    }
    return `${cousinType}, ${removal} time${removal > 1 ? 's' : ''} removed`
  }

  private getOrdinal(n: number): string {
    const ordinals = [
      '0th',
      '1st',
      '2nd',
      '3rd',
      '4th',
      '5th',
      '6th',
      '7th',
      '8th',
      '9th',
    ]
    return ordinals[n] || `${n}th`
  }

  private async getPersonNode(handle: string): Promise<PathNode> {
    const person = await this.prisma.person.findUnique({
      where: {handle},
    })
    return this.personToPathNode(person)
  }

  private personToPathNode(person: any, relationship = ''): PathNode {
    const primaryName = person?.primaryName
      ? JSON.parse(person.primaryName)
      : null
    const name = primaryName
      ? `${primaryName.first_name || ''} ${primaryName.surname_list?.[0]?.surname || ''}`.trim()
      : 'Unknown'

    return {
      handle: person?.handle || '',
      gramps_id: person?.grampsId || '',
      name,
      gender: person?.gender ?? 2,
      relationship,
    }
  }

  /**
   * Get optimized fan chart data (ancestors)
   */
  async getFanChartData(handle: string, maxGenerations = 5) {
    const root = await this.prisma.person.findUnique({
      where: {handle},
    })

    if (!root) {
      return null
    }

    const chartData = await this.buildAncestorTree(handle, 0, maxGenerations)
    return chartData
  }

  private async buildAncestorTree(
    handle: string,
    generation: number,
    maxGenerations: number,
  ): Promise<any> {
    if (generation >= maxGenerations) {
      return null
    }

    const person = await this.prisma.person.findUnique({
      where: {handle},
    })

    if (!person) {
      return null
    }

    // Get parent family
    // TODO: Performance optimization - same as getNeighbors, loads all families
    const allFamilies = await this.prisma.family.findMany()
    const childFamilies = allFamilies.filter(family => {
      if (!family.childRefList) return false
      const childList = JSON.parse(family.childRefList)
      return Array.isArray(childList) && childList.includes(handle)
    })

    let father = null
    let mother = null

    if (childFamilies.length > 0) {
      const family = childFamilies[0]
      if (family.fatherHandle) {
        father = await this.buildAncestorTree(
          family.fatherHandle,
          generation + 1,
          maxGenerations,
        )
      }
      if (family.motherHandle) {
        mother = await this.buildAncestorTree(
          family.motherHandle,
          generation + 1,
          maxGenerations,
        )
      }
    }

    return {
      person,
      handle: person.handle,
      gramps_id: person.grampsId,
      name: this.personToPathNode(person).name,
      gender: person.gender,
      generation,
      children: [father, mother].filter(Boolean),
    }
  }

  /**
   * Get optimized tree chart data (mixed ancestors and descendants)
   */
  async getTreeChartData(handle: string) {
    const person = await this.prisma.person.findUnique({
      where: {handle},
    })

    if (!person) {
      return null
    }

    return {
      person,
      ancestors: await this.buildAncestorTree(handle, 0, 3),
      descendants: await this.buildDescendantTree(handle, 0, 3),
    }
  }

  /**
   * Get descendant tree data
   */
  async getDescendantTree(handle: string, maxGenerations = 5) {
    return this.buildDescendantTree(handle, 0, maxGenerations)
  }

  private async buildDescendantTree(
    handle: string,
    generation: number,
    maxGenerations: number,
  ): Promise<any> {
    if (generation >= maxGenerations) {
      return null
    }

    const person = await this.prisma.person.findUnique({
      where: {handle},
    })

    if (!person) {
      return null
    }

    // Get families where this person is a parent
    const families = await this.prisma.family.findMany({
      where: {
        OR: [{fatherHandle: handle}, {motherHandle: handle}],
      },
    })

    const children = []
    for (const family of families) {
      if (family.childRefList) {
        const childList = JSON.parse(family.childRefList)
        if (Array.isArray(childList)) {
          for (const childHandle of childList) {
            const childTree = await this.buildDescendantTree(
              childHandle,
              generation + 1,
              maxGenerations,
            )
            if (childTree) {
              children.push(childTree)
            }
          }
        }
      }
    }

    return {
      person,
      handle: person.handle,
      gramps_id: person.grampsId,
      name: this.personToPathNode(person).name,
      gender: person.gender,
      generation,
      children,
    }
  }

  /**
   * Date calculator - performs various date calculations
   */
  async calculateDate(params: {
    operation: 'age' | 'difference' | 'dayOfWeek' | 'add' | 'subtract'
    date1: string
    date2?: string
    amount?: number
    unit?: 'days' | 'months' | 'years'
  }) {
    const {operation, date1, date2, amount, unit} = params
    const d1 = new Date(date1)

    if (operation === 'age') {
      const now = date2 ? new Date(date2) : new Date()
      const ageMs = now.getTime() - d1.getTime()
      const ageDate = new Date(ageMs)
      const years = Math.abs(ageDate.getUTCFullYear() - 1970)
      const months = ageDate.getUTCMonth()
      const days = ageDate.getUTCDate() - 1

      return {
        years,
        months,
        days,
        totalDays: Math.floor(ageMs / (1000 * 60 * 60 * 24)),
        description: `${years} years, ${months} months, ${days} days`,
      }
    }

    if (operation === 'difference' && date2) {
      const d2 = new Date(date2)
      const diffMs = Math.abs(d2.getTime() - d1.getTime())
      const diffDate = new Date(diffMs)
      const years = diffDate.getUTCFullYear() - 1970
      const months = diffDate.getUTCMonth()
      const days = diffDate.getUTCDate() - 1
      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      return {
        years,
        months,
        days,
        totalDays,
        totalWeeks: Math.floor(totalDays / 7),
        description: `${years} years, ${months} months, ${days} days`,
      }
    }

    if (operation === 'dayOfWeek') {
      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ]
      return {
        dayOfWeek: dayNames[d1.getDay()],
        dayNumber: d1.getDay(),
        date: date1,
      }
    }

    if (operation === 'add' && amount && unit) {
      const result = new Date(d1)
      if (unit === 'days') {
        result.setDate(result.getDate() + amount)
      } else if (unit === 'months') {
        result.setMonth(result.getMonth() + amount)
      } else if (unit === 'years') {
        result.setFullYear(result.getFullYear() + amount)
      }
      return {
        result: result.toISOString(),
        operation: `${date1} + ${amount} ${unit}`,
      }
    }

    if (operation === 'subtract' && amount && unit) {
      const result = new Date(d1)
      if (unit === 'days') {
        result.setDate(result.getDate() - amount)
      } else if (unit === 'months') {
        result.setMonth(result.getMonth() - amount)
      } else if (unit === 'years') {
        result.setFullYear(result.getFullYear() - amount)
      }
      return {
        result: result.toISOString(),
        operation: `${date1} - ${amount} ${unit}`,
      }
    }

    return {error: 'Invalid operation or missing parameters'}
  }

  /**
   * Get force-directed graph data for the entire family tree
   */
  async getGraphData() {
    const [people, families] = await Promise.all([
      this.prisma.person.findMany({
        select: {
          id: true,
          handle: true,
          grampsId: true,
          firstName: true,
          surname: true,
          gender: true,
          birthDate: true,
          deathDate: true,
        },
      }),
      this.prisma.family.findMany({
        select: {
          id: true,
          handle: true,
          fatherHandle: true,
          motherHandle: true,
          childRefList: true,
        },
      }),
    ])

    // Build nodes
    const nodes = people.map(person => ({
      id: person.handle,
      grampsId: person.grampsId,
      name: `${person.firstName || ''} ${person.surname || ''}`.trim() || 'Unknown',
      gender: person.gender,
      birthYear: person.birthDate
        ? this.extractYear(person.birthDate)
        : null,
      deathYear: person.deathDate
        ? this.extractYear(person.deathDate)
        : null,
    }))

    // Build links (edges)
    const links: Array<{
      source: string
      target: string
      type: 'parent' | 'spouse'
    }> = []

    families.forEach(family => {
      // Parent-child relationships
      if (family.childRefList) {
        try {
          const children = JSON.parse(family.childRefList)
          children.forEach((childRef: any) => {
            const childHandle =
              typeof childRef === 'string' ? childRef : childRef.ref

            if (family.fatherHandle) {
              links.push({
                source: family.fatherHandle,
                target: childHandle,
                type: 'parent',
              })
            }
            if (family.motherHandle) {
              links.push({
                source: family.motherHandle,
                target: childHandle,
                type: 'parent',
              })
            }
          })
        } catch (e) {
          // Skip invalid child ref lists
        }
      }

      // Spousal relationships
      if (family.fatherHandle && family.motherHandle) {
        links.push({
          source: family.fatherHandle,
          target: family.motherHandle,
          type: 'spouse',
        })
      }
    })

    return {
      nodes,
      links,
      stats: {
        totalPeople: nodes.length,
        totalRelationships: links.length,
      },
    }
  }

  /**
   * Get calendar events for a specific month
   */
  async getCalendarData(year: number, month: number) {
    const people = await this.prisma.person.findMany({
      select: {
        handle: true,
        grampsId: true,
        firstName: true,
        surname: true,
        birthDate: true,
        deathDate: true,
      },
    })

    const events: Array<{
      date: number
      type: 'birthday' | 'anniversary' | 'death'
      person: {
        handle: string
        name: string
      }
      year?: number
      age?: number
    }> = []

    people.forEach(person => {
      const name = `${person.firstName || ''} ${person.surname || ''}`.trim() || 'Unknown'

      // Parse birthday
      if (person.birthDate) {
        const birthInfo = this.parseDate(person.birthDate)
        if (birthInfo && birthInfo.month === month) {
          const age = year - birthInfo.year
          events.push({
            date: birthInfo.day,
            type: 'birthday',
            person: {handle: person.handle, name},
            year: birthInfo.year,
            age: age >= 0 ? age : undefined,
          })
        }
      }

      // Parse death anniversary
      if (person.deathDate) {
        const deathInfo = this.parseDate(person.deathDate)
        if (deathInfo && deathInfo.month === month) {
          const yearsSince = year - deathInfo.year
          events.push({
            date: deathInfo.day,
            type: 'death',
            person: {handle: person.handle, name},
            year: deathInfo.year,
            age: yearsSince >= 0 ? yearsSince : undefined,
          })
        }
      }
    })

    // Sort events by date
    events.sort((a, b) => a.date - b.date)

    return {
      year,
      month,
      events,
      totalEvents: events.length,
    }
  }

  /**
   * Helper to extract year from date string
   */
  private extractYear(dateStr: string): number | null {
    const yearMatch = dateStr.match(/\d{4}/)
    return yearMatch ? parseInt(yearMatch[0]) : null
  }

  /**
   * Helper to parse date string into components
   */
  private parseDate(dateStr: string): {
    year: number
    month: number
    day: number
  } | null {
    // Try to parse ISO format first
    const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/)
    if (isoMatch) {
      return {
        year: parseInt(isoMatch[1]),
        month: parseInt(isoMatch[2]),
        day: parseInt(isoMatch[3]),
      }
    }

    // Try to parse common formats
    const parts = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
    if (parts) {
      return {
        year: parseInt(parts[3]),
        month: parseInt(parts[1]),
        day: parseInt(parts[2]),
      }
    }

    return null
  }
}
