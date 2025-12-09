/* eslint-disable camelcase */
/**
 * CSV Parser for bulk import of people and events
 * Supports importing people with basic information from CSV files
 */

/**
 * Parse CSV content into Gramps Web people records
 * @param {string} csvContent - The CSV file content
 * @returns {Object} Parsed data with people and events
 */
export function parseCsv(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim())
  if (lines.length === 0) {
    return {people: [], events: [], families: []}
  }

  // Parse header
  const header = parseCSVLine(lines[0])
  const headerMap = normalizeHeaders(header)

  const people = []
  const events = []
  const families = []

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === 0) continue

    const row = {}
    header.forEach((h, idx) => {
      row[h] = values[idx] || ''
    })

    const person = createPersonFromRow(row, headerMap)
    if (person) {
      people.push(person)

      // Create birth event if data exists
      if (person.profile.birth?.date || person.profile.birth?.place_name) {
        events.push({
          handle: generateHandle(),
          gramps_id: `E${String(events.length + 1).padStart(4, '0')}`,
          type: {value: 'Birth'},
          date: {val: person.profile.birth.date || ''},
          place: person.profile.birth.place_name || '',
          description: `Birth of ${person.primary_name.first_name} ${person.primary_name.surname_list[0]?.surname || ''}`,
        })
      }

      // Create death event if data exists
      if (person.profile.death?.date || person.profile.death?.place_name) {
        events.push({
          handle: generateHandle(),
          gramps_id: `E${String(events.length + 1).padStart(4, '0')}`,
          type: {value: 'Death'},
          date: {val: person.profile.death.date || ''},
          place: person.profile.death.place_name || '',
          description: `Death of ${person.primary_name.first_name} ${person.primary_name.surname_list[0]?.surname || ''}`,
        })
      }
    }
  }

  return {people, events, families}
}

/**
 * Parse a single CSV line, handling quotes and commas
 */
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quotes
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

/**
 * Normalize CSV headers to standard field names
 */
function normalizeHeaders(headers) {
  const map = {}
  headers.forEach((h, idx) => {
    const normalized = h.toLowerCase().trim()
    // Map common variations to standard fields
    if (
      normalized.includes('first') ||
      normalized.includes('given') ||
      normalized === 'name'
    ) {
      map.firstName = idx
    } else if (
      normalized.includes('last') ||
      normalized.includes('surname') ||
      normalized.includes('family')
    ) {
      map.lastName = idx
    } else if (normalized.includes('middle')) {
      map.middleName = idx
    } else if (
      normalized.includes('sex') ||
      normalized.includes('gender')
    ) {
      map.gender = idx
    } else if (
      normalized.includes('birth') &&
      (normalized.includes('date') || normalized.includes('year'))
    ) {
      map.birthDate = idx
    } else if (normalized.includes('birth') && normalized.includes('place')) {
      map.birthPlace = idx
    } else if (
      normalized.includes('death') &&
      (normalized.includes('date') || normalized.includes('year'))
    ) {
      map.deathDate = idx
    } else if (normalized.includes('death') && normalized.includes('place')) {
      map.deathPlace = idx
    } else if (normalized.includes('id')) {
      map.id = idx
    }
  })
  return map
}

/**
 * Create a person record from a CSV row
 */
function createPersonFromRow(row, headerMap) {
  const values = Object.values(row)

  // Extract values using header map
  const firstName = headerMap.firstName !== undefined ? values[headerMap.firstName] : ''
  const lastName = headerMap.lastName !== undefined ? values[headerMap.lastName] : ''
  const middleName = headerMap.middleName !== undefined ? values[headerMap.middleName] : ''
  const genderStr = headerMap.gender !== undefined ? values[headerMap.gender] : ''
  const birthDate = headerMap.birthDate !== undefined ? values[headerMap.birthDate] : ''
  const birthPlace = headerMap.birthPlace !== undefined ? values[headerMap.birthPlace] : ''
  const deathDate = headerMap.deathDate !== undefined ? values[headerMap.deathDate] : ''
  const deathPlace = headerMap.deathPlace !== undefined ? values[headerMap.deathPlace] : ''
  const id = headerMap.id !== undefined ? values[headerMap.id] : ''

  // Skip empty rows
  if (!firstName && !lastName) {
    return null
  }

  // Determine gender
  let gender = 2 // Unknown
  const genderLower = genderStr.toLowerCase()
  if (genderLower === 'm' || genderLower === 'male') {
    gender = 1
  } else if (genderLower === 'f' || genderLower === 'female') {
    gender = 0
  }

  // Build full first name
  const fullFirstName = middleName
    ? `${firstName} ${middleName}`.trim()
    : firstName

  const handle = generateHandle()
  const grampsId = id || `I${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`

  return {
    handle,
    gramps_id: grampsId,
    gender,
    private: false,
    primary_name: {
      first_name: fullFirstName,
      surname_list: lastName ? [{surname: lastName}] : [],
      call: firstName,
    },
    profile: {
      name_surname: lastName || fullFirstName.split(' ').pop(),
      name_given: fullFirstName,
      birth: {
        date: birthDate,
        place_name: birthPlace,
      },
      death: {
        date: deathDate,
        place_name: deathPlace,
      },
    },
    media_list: [],
    event_ref_list: [],
    family_list: [],
  }
}

/**
 * Generate a random handle
 */
function generateHandle() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}

/**
 * Generate a sample CSV template
 */
export function generateCsvTemplate() {
  const headers = [
    'First Name',
    'Last Name',
    'Gender',
    'Birth Date',
    'Birth Place',
    'Death Date',
    'Death Place',
  ]
  const sample = [
    'John',
    'Doe',
    'M',
    '1980-01-01',
    'New York',
    '',
    '',
  ]

  return `${headers.join(',')}\n${sample.join(',')}\n`
}
