/* eslint-disable camelcase */
/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/**
 * GEDCOM 5.5.1 and 7.0 Parser
 * Supports parsing GEDCOM files into Gramps Web data structure
 */

/**
 * Parse a GEDCOM file into Gramps Web data structure
 * @param {string} gedcomContent - The GEDCOM file content
 * @param {string} version - GEDCOM version ('5.5.1' or '7.0')
 * @returns {Object} Parsed data in Gramps Web format
 */
export function parseGedcom(gedcomContent, version = '5.5.1') {
  const lines = gedcomContent.split('\n').filter(line => line.trim())
  const data = {
    people: [],
    families: [],
    events: [],
    places: [],
    sources: [],
    repositories: [],
    notes: [],
    media: [],
  }

  const records = parseRecords(lines)
  const gedcomMap = new Map() // Map GEDCOM IDs to handles

  // First pass: create handles for all records
  records.forEach(record => {
    const handle = generateHandle()
    gedcomMap.set(record.id, handle)
  })

  // Second pass: convert records
  records.forEach(record => {
    switch (record.tag) {
      case 'INDI':
        data.people.push(parseIndividual(record, gedcomMap, version))
        break
      case 'FAM':
        data.families.push(parseFamily(record, gedcomMap, version))
        break
      case 'SOUR':
        data.sources.push(parseSource(record, gedcomMap, version))
        break
      case 'REPO':
        data.repositories.push(parseRepository(record, gedcomMap, version))
        break
      case 'NOTE':
        data.notes.push(parseNote(record, gedcomMap, version))
        break
      case 'OBJE':
        data.media.push(parseMedia(record, gedcomMap, version))
        break
      default:
        // Ignore other top-level tags like HEAD, TRLR, SUBM
        break
    }
  })

  return data
}

/**
 * Parse GEDCOM lines into structured records
 */
function parseRecords(lines) {
  const records = []
  let currentRecord = null
  const stack = []

  lines.forEach(line => {
    const match = line.match(/^(\d+)\s+(@\w+@\s+)?(\w+)(\s+(.*))?$/)
    if (!match) return

    const [, level, xrefId, tag, , value] = match
    const lvl = parseInt(level, 10)
    const node = {
      level: lvl,
      tag,
      value: value || '',
      id: xrefId ? xrefId.trim() : null,
      children: [],
    }

    if (lvl === 0) {
      if (currentRecord) {
        records.push(currentRecord)
      }
      currentRecord = node
      stack.length = 0
      stack.push(node)
    } else {
      // Find parent
      while (stack.length > 0 && stack[stack.length - 1].level >= lvl) {
        stack.pop()
      }
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(node)
        stack.push(node)
      }
    }
  })

  if (currentRecord) {
    records.push(currentRecord)
  }

  return records
}

/**
 * Parse an individual (person) record
 */
function parseIndividual(record, gedcomMap, version) {
  const handle = gedcomMap.get(record.id)
  const person = {
    handle,
    gramps_id: extractGrampsId(record, 'I'),
    gender: 2, // Unknown
    private: false,
    primary_name: {
      first_name: '',
      surname_list: [],
      call: '',
    },
    profile: {
      name_surname: '',
      name_given: '',
      birth: {},
      death: {},
    },
    media_list: [],
    event_ref_list: [],
    family_list: [],
  }

  record.children.forEach(child => {
    switch (child.tag) {
      case 'NAME': {
        const name = parseName(child.value, version)
        person.primary_name = name
        person.profile.name_given = name.first_name
        person.profile.name_surname =
          name.surname_list[0]?.surname || name.first_name.split(' ').pop()
        break
      }
      case 'SEX':
        person.gender = child.value === 'M' ? 1 : child.value === 'F' ? 0 : 2
        break
      case 'BIRT': {
        const birth = parseEvent(child, gedcomMap)
        person.profile.birth = {
          date: birth.date,
          place_name: birth.place,
        }
        break
      }
      case 'DEAT': {
        const death = parseEvent(child, gedcomMap)
        person.profile.death = {
          date: death.date,
          place_name: death.place,
        }
        break
      }
      case 'FAMC':
      case 'FAMS': {
        const famId = child.value.replace(/@/g, '')
        const famHandle = gedcomMap.get(`@${famId}@`)
        if (famHandle && !person.family_list.includes(famHandle)) {
          person.family_list.push(famHandle)
        }
        break
      }
      default:
        break
    }
  })

  return person
}

/**
 * Parse a family record
 */
function parseFamily(record, gedcomMap, version) {
  const handle = gedcomMap.get(record.id)
  const family = {
    handle,
    gramps_id: extractGrampsId(record, 'F'),
    father_handle: null,
    mother_handle: null,
    child_ref_list: [],
    type: 1, // Married
  }

  record.children.forEach(child => {
    switch (child.tag) {
      case 'HUSB': {
        const id = child.value.replace(/@/g, '')
        family.father_handle = gedcomMap.get(`@${id}@`)
        break
      }
      case 'WIFE': {
        const id = child.value.replace(/@/g, '')
        family.mother_handle = gedcomMap.get(`@${id}@`)
        break
      }
      case 'CHIL': {
        const id = child.value.replace(/@/g, '')
        const childHandle = gedcomMap.get(`@${id}@`)
        if (childHandle) {
          family.child_ref_list.push({ref: childHandle})
        }
        break
      }
      default:
        break
    }
  })

  return family
}

/**
 * Parse a source record
 */
function parseSource(record, gedcomMap, version) {
  const handle = gedcomMap.get(record.id)
  const source = {
    handle,
    gramps_id: extractGrampsId(record, 'S'),
    title: '',
    author: '',
  }

  record.children.forEach(child => {
    switch (child.tag) {
      case 'TITL':
        source.title = child.value
        break
      case 'AUTH':
        source.author = child.value
        break
      default:
        break
    }
  })

  return source
}

/**
 * Parse a repository record
 */
function parseRepository(record, gedcomMap, version) {
  const handle = gedcomMap.get(record.id)
  const repo = {
    handle,
    gramps_id: extractGrampsId(record, 'R'),
    name: '',
  }

  record.children.forEach(child => {
    if (child.tag === 'NAME') {
      repo.name = child.value
    }
  })

  return repo
}

/**
 * Parse a note record
 */
function parseNote(record, gedcomMap, version) {
  const handle = gedcomMap.get(record.id)
  const note = {
    handle,
    gramps_id: extractGrampsId(record, 'N'),
    text: {string: record.value},
  }

  record.children.forEach(child => {
    if (child.tag === 'CONT' || child.tag === 'CONC') {
      note.text.string += (child.tag === 'CONT' ? '\n' : '') + child.value
    }
  })

  return note
}

/**
 * Parse a media record
 */
function parseMedia(record, gedcomMap, version) {
  const handle = gedcomMap.get(record.id)
  const media = {
    handle,
    gramps_id: extractGrampsId(record, 'O'),
    path: '',
    desc: '',
  }

  record.children.forEach(child => {
    switch (child.tag) {
      case 'FILE':
        media.path = child.value
        break
      case 'TITL':
        media.desc = child.value
        break
      default:
        break
    }
  })

  return media
}

/**
 * Parse a name from GEDCOM format
 */
function parseName(nameStr, version) {
  // GEDCOM format: "Given /Surname/"
  const match = nameStr.match(/^([^/]*)\s*\/([^/]*)\/?(.*)$/)
  if (match) {
    const [, given, surname, suffix] = match
    return {
      first_name: given.trim(),
      surname_list: surname.trim() ? [{surname: surname.trim()}] : [],
      call: given.trim().split(' ')[0],
      suffix: suffix.trim(),
    }
  }
  return {
    first_name: nameStr.trim(),
    surname_list: [],
    call: nameStr.trim().split(' ')[0],
  }
}

/**
 * Parse an event (birth, death, etc.)
 */
function parseEvent(eventNode, gedcomMap) {
  const event = {
    date: '',
    place: '',
  }

  eventNode.children.forEach(child => {
    switch (child.tag) {
      case 'DATE':
        event.date = child.value
        break
      case 'PLAC':
        event.place = child.value
        break
      default:
        break
    }
  })

  return event
}

/**
 * Extract or generate Gramps ID
 */
function extractGrampsId(record, prefix) {
  // Look for _UID or use record ID
  const uidNode = record.children.find(c => c.tag === '_UID')
  if (uidNode) {
    return uidNode.value
  }
  // Extract number from GEDCOM ID like @I123@ or @I0001@
  const match = record.id?.match(/@[A-Z]+(\d+)@/)
  if (match) {
    return `${prefix}${match[1].padStart(4, '0')}`
  }
  return `${prefix}${String(Math.floor(Math.random() * 10000)).padStart(
    4,
    '0'
  )}`
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
