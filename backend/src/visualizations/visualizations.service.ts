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
   */
  private async getNeighbors(personHandle: string): Promise<PathNode[]> {
    const neighbors: PathNode[] = []

    // Get person's families as child (query all families and filter in code)
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

  private getCousinTerm(stepsUp: number, stepsDown: number): string {
    const degree = Math.min(stepsUp, stepsDown) - 1
    const removal = Math.abs(stepsUp - stepsDown)

    // Aunt/Uncle or Niece/Nephew relationships (degree = 0)
    if (degree === 0) {
      if (removal === 0) {
        // Sibling (should not reach here as it's handled earlier)
        return 'Sibling'
      }
      // Determine if this person is older (aunt/uncle) or younger (niece/nephew)
      if (stepsUp > stepsDown) {
        // Going up more = target person is in an older generation (aunt/uncle)
        const prefix = removal > 1 ? `Great-${'Great-'.repeat(removal - 2)}` : ''
        return `${prefix}Aunt/Uncle`
      }
      // Going down more = target person is in a younger generation (niece/nephew)
      const prefix = removal > 1 ? `Great-${'Great-'.repeat(removal - 2)}` : ''
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
}
