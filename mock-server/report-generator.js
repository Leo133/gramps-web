/* eslint-disable camelcase */
/**
 * Report Generator for Phase 14
 * Generates various genealogy reports (pedigree charts, family group sheets, etc.)
 */

import crypto from 'crypto'

/**
 * Generate a unique report ID
 */
function generateReportId() {
  return `rep_${crypto.randomBytes(8).toString('hex')}`
}

/**
 * Calculate if a person is living based on death date or estimated age
 */
function isLiving(person) {
  // If death event exists with a date, person is deceased
  if (person.death?.date) {
    return false
  }

  // If birth date exists, check if person would be over 110 years old
  if (person.birth?.date) {
    const birthYear = new Date(person.birth.date).getFullYear()
    const currentYear = new Date().getFullYear()
    const age = currentYear - birthYear
    return age <= 110
  }

  // If no death date and no birth date, assume living
  return true
}

/**
 * Apply privacy filter to a person's data
 */
function applyPrivacyFilter(person, privacyLevel) {
  if (privacyLevel === 'all') {
    return person
  }

  const living = isLiving(person)

  if (privacyLevel === 'living' && living) {
    // Hide living individuals
    return null
  }

  if (privacyLevel === 'deceased' && !living) {
    // Only show deceased
    return person
  }

  if (privacyLevel === 'deceased' && living) {
    return null
  }

  // For 'public' or other privacy levels, apply custom rules
  if (person.private) {
    return null
  }

  return person
}

/**
 * Get a person's full name
 */
function getFullName(person) {
  if (!person?.primary_name) return 'Unknown'

  const {first_name = '', surname_list = []} = person.primary_name
  const surname = surname_list[0]?.surname || ''

  return `${first_name} ${surname}`.trim() || 'Unknown'
}

/**
 * Format a date for display
 */
function formatDate(dateStr) {
  if (!dateStr) return ''

  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Get event information as a formatted string
 */
function formatEvent(event, eventType) {
  if (!event) return ''

  const parts = []
  if (event.date) {
    parts.push(formatDate(event.date))
  }
  if (event.place) {
    parts.push(event.place)
  }

  return parts.length > 0 ? `${eventType}: ${parts.join(', ')}` : ''
}

/**
 * Get ancestors recursively for pedigree chart
 */
function getAncestors(personHandle, db, generations, currentGen = 0) {
  if (currentGen >= generations) {
    return null
  }

  const person = db.data.people?.find(p => p.handle === personHandle)
  if (!person) return null

  // Find parent family
  const parentFamily = db.data.families?.find(
    f => f.children && f.children.includes(personHandle)
  )

  const result = {
    person,
    generation: currentGen,
    ahnentafel: Math.pow(2, currentGen),
  }

  if (parentFamily && currentGen < generations - 1) {
    if (parentFamily.father_handle) {
      result.father = getAncestors(
        parentFamily.father_handle,
        db,
        generations,
        currentGen + 1
      )
    }
    if (parentFamily.mother_handle) {
      result.mother = getAncestors(
        parentFamily.mother_handle,
        db,
        generations,
        currentGen + 1
      )
    }
  }

  return result
}

/**
 * Get descendants recursively
 */
function getDescendants(personHandle, db, maxGenerations, currentGen = 0) {
  if (currentGen >= maxGenerations) {
    return null
  }

  const person = db.data.people?.find(p => p.handle === personHandle)
  if (!person) return null

  const result = {
    person,
    generation: currentGen,
    children: [],
    spouses: [],
  }

  // Find families where this person is a parent
  const families = db.data.families?.filter(
    f => f.father_handle === personHandle || f.mother_handle === personHandle
  )

  families?.forEach(family => {
    // Add spouse
    const spouseHandle =
      family.father_handle === personHandle
        ? family.mother_handle
        : family.father_handle
    if (spouseHandle) {
      const spouse = db.data.people?.find(p => p.handle === spouseHandle)
      if (spouse) {
        result.spouses.push(spouse)
      }
    }

    // Add children
    family.children?.forEach(childHandle => {
      const childTree = getDescendants(
        childHandle,
        db,
        maxGenerations,
        currentGen + 1
      )
      if (childTree) {
        result.children.push(childTree)
      }
    })
  })

  return result
}

/**
 * Generate Register numbering for descendants
 */
function generateRegisterNumber(path) {
  // path is array of indices: [0, 2, 1] means first generation, third child, second grandchild
  if (path.length === 0) return '1'
  if (path.length === 1) return `${path[0] + 1}`

  // Modified Register: 1, 2, 3, then i, ii, iii, then a, b, c
  const lastIndex = path[path.length - 1]

  if (path.length === 2) {
    // Use roman numerals for second generation
    const roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x']
    return roman[lastIndex] || `(${lastIndex + 1})`
  }

  // Use letters for third+ generation
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  return letters[lastIndex] || `(${lastIndex + 1})`
}

/**
 * Generate Henry numbering for descendants
 */
function generateHenryNumber(path) {
  // Henry system: 1, 11, 111, 1111, etc.
  return '1'.repeat(path.length + 1)
}

/**
 * Generate d'Aboville numbering for descendants
 */
function generateDAbovilleNumber(path) {
  // d'Aboville system: 1, 1.1, 1.2, 1.1.1, 1.1.2, etc.
  return ['1', ...path.map(i => i + 1)].join('.')
}

/**
 * Generate numbering based on selected system
 */
function generateDescendantNumber(path, system) {
  switch (system) {
    case 'register':
    case 'ngsq':
      return generateRegisterNumber(path)
    case 'henry':
      return generateHenryNumber(path)
    case 'daboville':
      return generateDAbovilleNumber(path)
    default:
      return path.join('.')
  }
}

/**
 * Format descendant tree as text
 */
function formatDescendantTree(
  tree,
  config,
  path = [],
  result = {text: '', count: 0}
) {
  if (!tree) return result

  const filteredPerson = applyPrivacyFilter(tree.person, config.privacyLevel)
  if (!filteredPerson) return result

  const number = generateDescendantNumber(path, config.numberingSystem)
  const name = getFullName(filteredPerson)
  const indent = '  '.repeat(tree.generation)

  result.count++

  let personInfo = `${indent}${number}. ${name}`

  if (config.includeEvents) {
    const birth = formatEvent(filteredPerson.birth, 'b')
    const death = formatEvent(filteredPerson.death, 'd')
    if (birth || death) {
      personInfo += ` (${[birth, death].filter(Boolean).join('; ')})`
    }
  }

  result.text += personInfo + '\n'

  // Add spouse information
  if (config.includeSpouses && tree.spouses.length > 0) {
    tree.spouses.forEach(spouse => {
      const filteredSpouse = applyPrivacyFilter(spouse, config.privacyLevel)
      if (filteredSpouse) {
        const spouseName = getFullName(filteredSpouse)
        result.text += `${indent}  m. ${spouseName}\n`
      }
    })
  }

  // Process children
  tree.children.forEach((child, index) => {
    formatDescendantTree(child, config, [...path, index], result)
  })

  return result
}

/**
 * Format ancestor tree as text with Ahnentafel numbering
 */
function formatAncestorTree(
  tree,
  config,
  ahnentafelNum = 1,
  result = {text: '', count: 0}
) {
  if (!tree) return result

  const filteredPerson = applyPrivacyFilter(tree.person, config.privacyLevel)
  if (!filteredPerson) return result

  const name = getFullName(filteredPerson)
  result.count++

  let personInfo = `${ahnentafelNum}. ${name}`

  if (config.includeEvents) {
    const birth = formatEvent(filteredPerson.birth, 'b')
    const death = formatEvent(filteredPerson.death, 'd')
    if (birth || death) {
      personInfo += ` (${[birth, death].filter(Boolean).join('; ')})`
    }
  }

  result.text += personInfo + '\n'

  // Process father (ahnentafel * 2)
  if (tree.father) {
    formatAncestorTree(tree.father, config, ahnentafelNum * 2, result)
  }

  // Process mother (ahnentafel * 2 + 1)
  if (tree.mother) {
    formatAncestorTree(tree.mother, config, ahnentafelNum * 2 + 1, result)
  }

  return result
}

/**
 * Generate a pedigree chart report
 */
export function generatePedigreeReport(db, config) {
  const {
    personId,
    generations = 4,
    includePhotos = true,
    includeDates = true,
    includePlaces = true,
    privacyLevel = 'living',
    orientation = 'landscape',
    theme = 'classic',
  } = config

  // Find the starting person
  const person = db.data.people?.find(p => p.gramps_id === personId)
  if (!person) {
    throw new Error(`Person ${personId} not found`)
  }

  // Build ancestor tree
  const ancestorTree = getAncestors(person.handle, db, generations)

  // Count total people in chart
  let personCount = 0
  function countPeople(tree) {
    if (!tree) return
    const filtered = applyPrivacyFilter(tree.person, privacyLevel)
    if (filtered) personCount++
    if (tree.father) countPeople(tree.father)
    if (tree.mother) countPeople(tree.mother)
  }
  countPeople(ancestorTree)

  const reportId = generateReportId()
  const filename = `pedigree_chart_${getFullName(person).replace(/ /g, '_')}.pdf`

  return {
    reportId,
    type: 'pedigree',
    url: `/api/reports/download/${reportId}`,
    format: 'pdf',
    filename,
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      personId,
      personName: getFullName(person),
      generations,
      personCount,
      includePhotos,
      includeDates,
      includePlaces,
      privacyLevel,
      orientation,
      theme,
    },
    data: ancestorTree,
  }
}

/**
 * Generate a family group sheet report
 */
export function generateFamilyGroupSheet(db, config) {
  const {
    familyId,
    includeNotes = true,
    includeSources = true,
    includePhotos = true,
    privacyLevel = 'living',
    detailLevel = 'full',
  } = config

  // Find the family
  const family = db.data.families?.find(f => f.gramps_id === familyId)
  if (!family) {
    throw new Error(`Family ${familyId} not found`)
  }

  // Get family members
  const father = family.father_handle
    ? db.data.people?.find(p => p.handle === family.father_handle)
    : null
  const mother = family.mother_handle
    ? db.data.people?.find(p => p.handle === family.mother_handle)
    : null

  const children = (family.children || [])
    .map(childHandle => db.data.people?.find(p => p.handle === childHandle))
    .filter(Boolean)

  // Apply privacy filters
  const filteredFather = father
    ? applyPrivacyFilter(father, privacyLevel)
    : null
  const filteredMother = mother
    ? applyPrivacyFilter(mother, privacyLevel)
    : null
  const filteredChildren = children
    .map(c => applyPrivacyFilter(c, privacyLevel))
    .filter(Boolean)

  const reportId = generateReportId()
  const familyName = [
    filteredFather ? getFullName(filteredFather) : '',
    filteredMother ? getFullName(filteredMother) : '',
  ]
    .filter(Boolean)
    .join(' and ')

  const filename = `family_group_sheet_${familyName.replace(/ /g, '_')}.pdf`

  return {
    reportId,
    type: 'family-group-sheet',
    url: `/api/reports/download/${reportId}`,
    format: 'pdf',
    filename,
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      familyId,
      familyName,
      childrenCount: filteredChildren.length,
      includeNotes,
      includeSources,
      includePhotos,
      privacyLevel,
      detailLevel,
    },
    data: {
      family,
      father: filteredFather,
      mother: filteredMother,
      children: filteredChildren,
    },
  }
}

/**
 * Generate a descendant report
 */
export function generateDescendantReport(db, config) {
  const {
    personId,
    generations = 5,
    numberingSystem = 'register',
    format = 'narrative',
    includeSpouses = true,
    includeEvents = true,
    privacyLevel = 'all',
  } = config

  // Find the starting person
  const person = db.data.people?.find(p => p.gramps_id === personId)
  if (!person) {
    throw new Error(`Person ${personId} not found`)
  }

  // Build descendant tree
  const descendantTree = getDescendants(person.handle, db, generations)

  // Format as text
  const formattedReport = formatDescendantTree(descendantTree, config)

  const reportId = generateReportId()
  const filename = `descendant_report_${getFullName(person).replace(/ /g, '_')}.pdf`

  return {
    reportId,
    type: 'descendant',
    url: `/api/reports/download/${reportId}`,
    format: 'pdf',
    filename,
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      personId,
      personName: getFullName(person),
      generations,
      descendantCount: formattedReport.count,
      numberingSystem,
      format,
      includeSpouses,
      includeEvents,
      privacyLevel,
    },
    content: formattedReport.text,
    data: descendantTree,
  }
}

/**
 * Generate an ancestor report
 */
export function generateAncestorReport(db, config) {
  const {
    personId,
    generations = 6,
    includeEvents = true,
    includeSources = true,
    privacyLevel = 'living',
    format = 'outline',
  } = config

  // Find the starting person
  const person = db.data.people?.find(p => p.gramps_id === personId)
  if (!person) {
    throw new Error(`Person ${personId} not found`)
  }

  // Build ancestor tree
  const ancestorTree = getAncestors(person.handle, db, generations)

  // Format as text with Ahnentafel numbering
  const formattedReport = formatAncestorTree(ancestorTree, config)

  const reportId = generateReportId()
  const filename = `ancestor_report_${getFullName(person).replace(/ /g, '_')}.pdf`

  return {
    reportId,
    type: 'ancestor',
    url: `/api/reports/download/${reportId}`,
    format: 'pdf',
    filename,
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      personId,
      personName: getFullName(person),
      generations,
      ancestorCount: formattedReport.count,
      includeEvents,
      includeSources,
      privacyLevel,
      format,
    },
    content: formattedReport.text,
    data: ancestorTree,
  }
}

/**
 * Generate mock PDF content
 */
export function generatePDFContent(report) {
  // In a real implementation, this would use PDFKit to generate actual PDF
  // For now, return a simple text-based representation

  let content = `GENEALOGY REPORT\n`
  content += `Type: ${report.type.toUpperCase()}\n`
  content += `Generated: ${new Date(report.generatedAt).toLocaleString()}\n`
  content += `\n${'='.repeat(60)}\n\n`

  if (report.content) {
    content += report.content
  } else if (report.metadata) {
    content += `Report Details:\n`
    Object.entries(report.metadata).forEach(([key, value]) => {
      content += `  ${key}: ${value}\n`
    })
  }

  return content
}
