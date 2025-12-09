/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable no-continue */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import {Low} from 'lowdb'
import {JSONFile} from 'lowdb/node'
import Fuse from 'fuse.js'
import crypto from 'crypto'

import compression from 'compression'

const app = express()
const PORT = process.env.PORT || 5555

app.use(compression())
app.use(cors())
app.use(bodyParser.json({limit: '10mb'}))

// Request Logger & Timer
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(
      `${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`
    )
  })
  next()
})

// Database Setup
const adapter = new JSONFile('db.json')
const db = new Low(adapter, {
  users: [],
  people: [
    {
      gramps_id: 'I0001',
      primary_name: {
        first_name: 'John',
        surname_list: [{surname: 'Doe'}],
      },
      profile: {
        birth: {date: '1980-01-01'},
      },
    },
  ],
  families: [],
  metadata: {},
  tree_settings: {},
})

await db.read()

// Initialize DB with default data if empty
if (!db.data.users || db.data.users.length === 0) {
  db.data = {
    users: [
      {
        username: 'owner',
        email: 'owner@example.com',
        full_name: 'Owner User',
        role: 'owner',
        last_login: new Date().toISOString(),
        first_login: new Date().toISOString(),
        email_verified: true,
        enabled: true,
      },
    ],
    people: [
      {
        handle: 'p0001',
        gramps_id: 'I0001',
        gender: 1, // Male
        private: false,
        primary_name: {
          first_name: 'John',
          surname_list: [{surname: 'Doe'}],
          call: 'John',
        },
        profile: {
          name_surname: 'Doe',
          name_given: 'John',
          birth: {
            date: '1980-01-01',
            place_name: 'New York',
          },
          death: {},
        },
        media_list: [],
        event_ref_list: [],
        family_list: ['f0001'],
      },
      {
        handle: 'p0002',
        gramps_id: 'I0002',
        gender: 0, // Female
        private: false,
        primary_name: {
          first_name: 'Jane',
          surname_list: [{surname: 'Smith'}],
          call: 'Jane',
        },
        profile: {
          name_surname: 'Smith',
          name_given: 'Jane',
          birth: {
            date: '1982-05-15',
            place_name: 'London',
          },
          death: {},
        },
        media_list: [],
        event_ref_list: [],
        family_list: ['f0001'],
      },
    ],
    families: [
      {
        handle: 'f0001',
        gramps_id: 'F0001',
        father_handle: 'p0001',
        mother_handle: 'p0002',
        child_ref_list: [],
        type: 1, // Married
      },
    ],
    events: [
      {
        handle: 'e0001',
        gramps_id: 'E0001',
        type: {value: 'Birth'},
        date: {val: '1980-01-01'},
        place: 'pl0001',
        description: 'Birth of John Doe',
        private: false,
        citation_list: [],
      },
      {
        handle: 'e0002',
        gramps_id: 'E0002',
        type: {value: 'Birth'},
        date: {val: '1982-05-15'},
        place: 'pl0002',
        description: 'Birth of Jane Smith',
        private: false,
        citation_list: [],
      },
    ],
    places: [
      {
        handle: 'pl0001',
        gramps_id: 'P0001',
        name: {value: 'New York'},
        title: 'New York, New York, USA',
        type: {value: 'City'},
        lat: '40.7128',
        long: '-74.0060',
        placeref_list: [
          {ref: 'pl0003'}, // New York State
        ],
        private: false,
      },
      {
        handle: 'pl0002',
        gramps_id: 'P0002',
        name: {value: 'London'},
        title: 'London, England, United Kingdom',
        type: {value: 'City'},
        lat: '51.5074',
        long: '-0.1278',
        placeref_list: [
          {ref: 'pl0004'}, // England
        ],
        private: false,
      },
      {
        handle: 'pl0003',
        gramps_id: 'P0003',
        name: {value: 'New York'},
        title: 'New York, USA',
        type: {value: 'State'},
        placeref_list: [
          {ref: 'pl0005'}, // USA
        ],
        private: false,
      },
      {
        handle: 'pl0004',
        gramps_id: 'P0004',
        name: {value: 'England'},
        title: 'England, United Kingdom',
        type: {value: 'State'},
        placeref_list: [
          {ref: 'pl0006'}, // UK
        ],
        private: false,
      },
      {
        handle: 'pl0005',
        gramps_id: 'P0005',
        name: {value: 'United States'},
        title: 'United States of America',
        type: {value: 'Country'},
        placeref_list: [],
        private: false,
      },
      {
        handle: 'pl0006',
        gramps_id: 'P0006',
        name: {value: 'United Kingdom'},
        title: 'United Kingdom',
        type: {value: 'Country'},
        placeref_list: [],
        private: false,
      },
    ],
    media: [],
    repositories: [
      {
        handle: 'r0001',
        gramps_id: 'R0001',
        name: 'National Archives',
        type: {value: 'Library'},
        address_list: [
          {
            street: '700 Pennsylvania Avenue NW',
            city: 'Washington',
            state: 'DC',
            postal: '20408',
            country: 'USA',
          },
        ],
        urls: [
          {
            href: 'https://www.archives.gov/',
            desc: 'National Archives Website',
            type: {value: 'Web Home'},
          },
        ],
        private: false,
      },
    ],
    sources: [
      {
        handle: 's0001',
        gramps_id: 'S0001',
        title: '1900 United States Federal Census',
        author: 'U.S. Census Bureau',
        pubinfo: 'Washington, D.C.: National Archives and Records Administration',
        abbrev: '1900 Census',
        reporef_list: [
          {
            ref: 'r0001',
            call_number: 'T623',
            media_type: {value: 'Microfilm'},
          },
        ],
        private: false,
      },
    ],
    citations: [
      {
        handle: 'c0001',
        gramps_id: 'C0001',
        source_handle: 's0001',
        page: 'Sheet 5, Line 23',
        confidence: 2, // High confidence
        date: {val: '1900-06-01'},
        private: false,
      },
    ],
    notes: [
      {
        handle: 'n0001',
        gramps_id: 'N0001',
        text: {
          string: 'This is a sample note about John Doe. He was born in New York City.',
        },
        type: {value: 'General'},
        private: false,
      },
    ],
    metadata: {
      version: '1.0.0',
      title: 'Gramps Web Lite',
      allow_registration: true,
      server: {
        chat: true,
      },
      gramps_webapi: {
        version: '3.3.0',
      },
      database: {
        actual_schema: '1',
        schema: '1.0',
      },
      locale: {
        language: 'en',
      },
    },
    tree_settings: {
      min_role_ai: 0,
    },
  }
  await db.write()
}

// Helper Functions
function base64UrlEncode(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function createMockToken(payload) {
  const header = {alg: 'HS256', typ: 'JWT'}
  const encodedHeader = base64UrlEncode(header)
  const encodedPayload = base64UrlEncode({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    iat: Math.floor(Date.now() / 1000),
  })
  return `${encodedHeader}.${encodedPayload}.mockSignature`
}

// Validation Functions
function parseDate(dateStr) {
  if (!dateStr) return null
  // Handle different date formats
  let dateString = dateStr
  if (typeof dateStr === 'object' && dateStr.val) {
    dateString = dateStr.val
  }
  const date = new Date(dateString)
  // Check if date is valid
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date
}

function validatePerson(person) {
  const errors = []
  const warnings = []

  // Get birth and death events
  const birthEvent = (person.event_ref_list || [])
    .map(ref => (db.data.events || []).find(e => e.handle === ref.ref))
    .find(e => e && e.type.value === 'Birth')

  const deathEvent = (person.event_ref_list || [])
    .map(ref => (db.data.events || []).find(e => e.handle === ref.ref))
    .find(e => e && e.type.value === 'Death')

  // Birth must be before death
  if (birthEvent && deathEvent) {
    const birthDate = parseDate(birthEvent.date)
    const deathDate = parseDate(deathEvent.date)

    if (birthDate && deathDate && birthDate > deathDate) {
      errors.push({
        field: 'events',
        message: 'Birth date must be before death date',
        severity: 'error',
      })
    }
  }

  return {valid: errors.length === 0, errors, warnings}
}

function validateFamily(family) {
  const errors = []
  const warnings = []

  // Get parents
  const father = (db.data.people || []).find(
    p => p.handle === family.father_handle
  )
  const mother = (db.data.people || []).find(
    p => p.handle === family.mother_handle
  )

  // Get children
  const children = (family.child_ref_list || []).map(ref =>
    (db.data.people || []).find(p => p.handle === ref.ref)
  )

  // Check parent-child age relationships
  if (father || mother) {
    children.forEach(child => {
      if (!child) return

      const childBirthEvent = (child.event_ref_list || [])
        .map(ref => (db.data.events || []).find(e => e.handle === ref.ref))
        .find(e => e && e.type.value === 'Birth')

      const childBirthDate = childBirthEvent
        ? parseDate(childBirthEvent.date)
        : null

      if (father && childBirthDate) {
        const fatherBirthEvent = (father.event_ref_list || [])
          .map(ref => (db.data.events || []).find(e => e.handle === ref.ref))
          .find(e => e && e.type.value === 'Birth')

        const fatherBirthDate = fatherBirthEvent
          ? parseDate(fatherBirthEvent.date)
          : null

        if (fatherBirthDate && childBirthDate) {
          const ageAtBirth =
            (childBirthDate - fatherBirthDate) / (1000 * 60 * 60 * 24 * 365.25)

          if (ageAtBirth < 12) {
            errors.push({
              field: 'children',
              message: `Father was too young (${Math.floor(ageAtBirth)} years) at child's birth`,
              severity: 'error',
            })
          } else if (ageAtBirth < 16) {
            warnings.push({
              field: 'children',
              message: `Father was very young (${Math.floor(ageAtBirth)} years) at child's birth`,
              severity: 'warning',
            })
          } else if (ageAtBirth > 80) {
            warnings.push({
              field: 'children',
              message: `Father was very old (${Math.floor(ageAtBirth)} years) at child's birth`,
              severity: 'warning',
            })
          }
        }
      }

      if (mother && childBirthDate) {
        const motherBirthEvent = (mother.event_ref_list || [])
          .map(ref => (db.data.events || []).find(e => e.handle === ref.ref))
          .find(e => e && e.type.value === 'Birth')

        const motherBirthDate = motherBirthEvent
          ? parseDate(motherBirthEvent.date)
          : null

        if (motherBirthDate && childBirthDate) {
          const ageAtBirth =
            (childBirthDate - motherBirthDate) / (1000 * 60 * 60 * 24 * 365.25)

          if (ageAtBirth < 12) {
            errors.push({
              field: 'children',
              message: `Mother was too young (${Math.floor(ageAtBirth)} years) at child's birth`,
              severity: 'error',
            })
          } else if (ageAtBirth < 15) {
            warnings.push({
              field: 'children',
              message: `Mother was very young (${Math.floor(ageAtBirth)} years) at child's birth`,
              severity: 'warning',
            })
          } else if (ageAtBirth > 50) {
            warnings.push({
              field: 'children',
              message: `Mother was very old (${Math.floor(ageAtBirth)} years) at child's birth`,
              severity: 'warning',
            })
          }
        }
      }
    })
  }

  // Check gender consistency
  if (father && father.gender !== 1) {
    warnings.push({
      field: 'father',
      message: 'Father has non-male gender',
      severity: 'warning',
    })
  }

  if (mother && mother.gender !== 0) {
    warnings.push({
      field: 'mother',
      message: 'Mother has non-female gender',
      severity: 'warning',
    })
  }

  return {valid: errors.length === 0, errors, warnings}
}

function validateEvent(event) {
  const errors = []
  const warnings = []

  // Validate date format
  if (event.date && event.date.val) {
    const date = parseDate(event.date.val)
    if (!date || Number.isNaN(date.getTime())) {
      errors.push({
        field: 'date',
        message: 'Invalid date format',
        severity: 'error',
      })
    }
  }

  // Validate place reference
  if (event.place) {
    const place = (db.data.places || []).find(p => p.handle === event.place)
    if (!place) {
      errors.push({
        field: 'place',
        message: 'Referenced place does not exist',
        severity: 'error',
      })
    }
  }

  return {valid: errors.length === 0, errors, warnings}
}

// --- Routes ---

// Auth
app.post('/api/token/', (req, res) => {
  const {username, password} = req.body
  // Simple auth check (accepts owner/owner)
  if (username === 'owner' && password === 'owner') {
    const token = createMockToken({
      sub: username,
      role: 'owner',
      tree: 'gramps',
      permissions: {
        canUseChat: true,
      },
    })
    res.json({
      access_token: token,
      refresh_token: 'mock_refresh_token',
    })
  } else {
    res.status(401).json({error: 'Invalid credentials'})
  }
})

app.post('/api/token/refresh/', (req, res) => {
  const token = createMockToken({
    sub: 'owner',
    role: 'owner',
    tree: 'gramps',
    permissions: {
      canUseChat: true,
    },
  })
  res.json({
    access_token: token,
  })
})

// Metadata
app.get('/api/metadata/', (req, res) => {
  res.json(db.data.metadata)
})

// Users
app.get('/api/users/', (req, res) => {
  res.json(db.data.users)
})

// Generic Resource Handler (People, Families, etc.)
const resourceTypes = [
  'people',
  'families',
  'places',
  'events',
  'media',
  'repositories',
  'sources',
  'citations',
  'notes',
]

const searchKeys = {
  people: [
    'gramps_id',
    'handle',
    'primary_name.first_name',
    'primary_name.surname_list.surname',
  ],
  families: ['gramps_id', 'handle'],
  events: ['gramps_id', 'handle', 'description', 'type.value'],
  places: ['gramps_id', 'handle', 'name', 'title'],
  media: ['gramps_id', 'handle', 'desc', 'path'],
  repositories: ['gramps_id', 'handle', 'name'],
  sources: ['gramps_id', 'handle', 'title', 'author'],
  citations: ['gramps_id', 'handle', 'page'],
  notes: ['gramps_id', 'handle', 'content'],
}

resourceTypes.forEach(type => {
  app.get(`/api/${type}/`, (req, res) => {
    const {q, page = 1, pagesize = 25, gramps_id} = req.query
    let results = db.data[type] || []

    if (gramps_id) {
      results = results.filter(r => r.gramps_id === gramps_id)
    } else if (q) {
      // Simple search (can be improved with Fuse.js per type)
      const keys = searchKeys[type] || ['gramps_id', 'handle']
      const fuse = new Fuse(results, {
        keys,
        threshold: 0.3,
      })
      results = fuse.search(q).map(r => r.item)
    }

    const totalCount = results.length
    const start = (parseInt(page, 10) - 1) * parseInt(pagesize, 10)
    const end = start + parseInt(pagesize, 10)
    const paginatedResults = results.slice(start, end)
    res.setHeader('X-Total-Count', totalCount)
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count') // Important for CORS
    res.json(paginatedResults)
  })

  app.get(`/api/${type}/:handle`, (req, res) => {
    const item = (db.data[type] || []).find(i => i.handle === req.params.handle)
    if (item) res.json(item)
    else res.status(404).json({error: 'Not found'})
  })

  app.put(`/api/${type}/:handle`, async (req, res) => {
    const {handle} = req.params
    const updatedItem = req.body
    const collection = db.data[type] || []
    const index = collection.findIndex(i => i.handle === handle)

    if (index !== -1) {
      // Validate before updating
      let validationResult = {valid: true, errors: [], warnings: []}

      if (type === 'people') {
        validationResult = validatePerson(updatedItem)
      } else if (type === 'families') {
        validationResult = validateFamily(updatedItem)
      } else if (type === 'events') {
        validationResult = validateEvent(updatedItem)
      }

      // Return validation errors
      if (!validationResult.valid) {
        return res.status(400).json({
          error: 'Validation failed',
          validation: validationResult,
        })
      }

      // Merge existing item with updates
      db.data[type][index] = {...collection[index], ...updatedItem}
      await db.write()

      // Return updated item with validation warnings
      return res.json({
        ...db.data[type][index],
        _validation:
          validationResult.warnings.length > 0 ? validationResult : undefined,
      })
    }
    return res.status(404).json({error: 'Not found'})
  })

  app.delete(`/api/${type}/:handle`, async (req, res) => {
    const {handle} = req.params
    const collection = db.data[type] || []
    const index = collection.findIndex(i => i.handle === handle)

    if (index !== -1) {
      db.data[type].splice(index, 1)
      await db.write()
      res.status(204).send()
    } else {
      res.status(404).json({error: 'Not found'})
    }
  })
})

// Create Objects (Batch)
app.post('/api/objects/', async (req, res) => {
  const objects = req.body // Array of objects to create
  const createdObjects = []
  const validationErrors = []

  for (const obj of objects) {
    const typeMap = {
      Person: 'people',
      Family: 'families',
      Event: 'events',
      Place: 'places',
      Media: 'media',
      Repository: 'repositories',
      Source: 'sources',
      Citation: 'citations',
      Note: 'notes',
    }

    const collectionName = typeMap[obj._class]
    if (!collectionName) {
      console.warn(`Unknown class: ${obj._class}`)
      continue
    }

    // Generate ID if missing
    if (!obj.gramps_id) {
      const prefixMap = {
        Person: 'I',
        Family: 'F',
        Event: 'E',
        Place: 'P',
        Media: 'O',
        Repository: 'R',
        Source: 'S',
        Citation: 'C',
        Note: 'N',
      }
      const prefix = prefixMap[obj._class] || 'X'
      const count =
        (db.data[collectionName] || []).length +
        1 +
        createdObjects.filter(o => o.new._class === obj._class).length
      obj.gramps_id = `${prefix}${String(count).padStart(4, '0')}`
    }

    // Ensure handle exists
    if (!obj.handle) {
      obj.handle = crypto.randomBytes(8).toString('hex')
    }

    // Validate before creating
    let validationResult = {valid: true, errors: [], warnings: []}

    if (obj._class === 'Person') {
      validationResult = validatePerson(obj)
    } else if (obj._class === 'Family') {
      validationResult = validateFamily(obj)
    } else if (obj._class === 'Event') {
      validationResult = validateEvent(obj)
    }

    // Skip if validation fails
    if (!validationResult.valid) {
      validationErrors.push({
        object: obj,
        validation: validationResult,
      })
      continue
    }

    // Add to DB
    if (!db.data[collectionName]) db.data[collectionName] = []
    db.data[collectionName].push(obj)

    createdObjects.push({new: obj})
  }

  await db.write()

  // Return results with validation errors if any
  const response = {data: createdObjects}
  if (validationErrors.length > 0) {
    response.validation_errors = validationErrors
  }
  res.json(response)
})

// Validation Endpoint
app.post('/api/validate/:type', (req, res) => {
  const {type} = req.params
  const object = req.body

  let validationResult = {valid: true, errors: [], warnings: []}

  if (type === 'person' || type === 'people') {
    validationResult = validatePerson(object)
  } else if (type === 'family' || type === 'families') {
    validationResult = validateFamily(object)
  } else if (type === 'event' || type === 'events') {
    validationResult = validateEvent(object)
  } else {
    return res.status(400).json({error: 'Unknown validation type'})
  }

  return res.json(validationResult)
})

// Tree Settings
app.get('/api/trees/-', (req, res) => {
  res.json(db.data.tree_settings)
})

app.put('/api/trees/-', async (req, res) => {
  db.data.tree_settings = {...db.data.tree_settings, ...req.body}
  await db.write()
  res.json(db.data.tree_settings)
})

// Chat Logic
app.post('/api/chat/', (req, res) => {
  const {query} = req.body
  console.log('Chat query:', query)

  // 1. Analyze Query
  const lowerQuery = query.toLowerCase()

  // 2. Search for People mentioned
  const fuse = new Fuse(db.data.people, {
    keys: [
      'primary_name.first_name',
      'primary_name.surname_list.surname',
      'gramps_id',
    ],
    threshold: 0.3,
    includeScore: true,
  })

  // Split query into words to find potential names
  const words = query.split(' ')
  let bestMatch = null

  for (const word of words) {
    // Ignore common words
    if (
      ['who', 'is', 'tell', 'me', 'about', 'the'].includes(word.toLowerCase())
    )
      continue

    const results = fuse.search(word)
    if (results.length > 0) {
      if (!bestMatch || results[0].score < bestMatch.score) {
        ;[bestMatch] = results
      }
    }
  }

  const searchResults = bestMatch ? [bestMatch] : []

  let response = ''

  if (searchResults.length > 0 && searchResults[0].score < 0.4) {
    const [{item: person}] = searchResults
    const name = `${person.primary_name.first_name} ${person.primary_name.surname_list[0].surname}`

    if (lowerQuery.includes('who is') || lowerQuery.includes('tell me about')) {
      response = `That is ${name}. `
      if (person.profile.birth && person.profile.birth.date) {
        response += `They were born on ${person.profile.birth.date}`
        if (person.profile.birth.place_name) {
          response += ` in ${person.profile.birth.place_name}`
        }
        response += '. '
      }
      if (person.profile.death && person.profile.death.date) {
        response += `They died on ${person.profile.death.date}.`
      } else {
        response += "I don't have a death date for them."
      }
    } else if (lowerQuery.includes('born')) {
      if (person.profile.birth && person.profile.birth.date) {
        response += `${name} was born on ${person.profile.birth.date}`
        if (person.profile.birth.place_name) {
          response += ` in ${person.profile.birth.place_name}`
        }
        response += '.'
      } else {
        response += `I don't know when ${name} was born.`
      }
    } else {
      response = `I found ${name} in your tree. What would you like to know about them?`
    }
  } else if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
    // General conversation
    response =
      'Hello! I can help you explore your family tree. Ask me about a person.'
  } else if (lowerQuery.includes('count') || lowerQuery.includes('how many')) {
    response = `You have ${db.data.people.length} people in your family tree.`
  } else {
    response =
      "I'm not sure who you are talking about. Try asking 'Who is [Name]?'"
  }

  // Simulate network delay for realism
  // setTimeout(() => {
  res.json({
    response,
  })
  // }, 500);
})

// Translations
app.post('/api/translations/:lang', (req, res) => {
  const {strings} = req.body
  console.log(
    `Translation request for ${req.params.lang} with ${strings?.length} strings`
  )
  // Echo back strings as translations (mocking English/default)
  const translations = (strings || []).map(s => ({
    original: s,
    translation: s,
  }))
  res.json(translations)
})

// Search (Mock)
app.get('/api/search/', (req, res) => {
  res.json({
    results: [],
    count: 0,
  })
})

// Sources (Mock)
app.get('/api/sources/', (req, res) => {
  res.json({
    results: [],
    count: 0,
  })
})

// Generic handler for other requests (logging)
app.use('/api', (req, res) => {
  console.log(`[Unimplemented] ${req.method} ${req.originalUrl}`)
  // Return empty object/list to prevent frontend hanging on 404
  res.json({results: [], count: 0, data: {}})
})

app.listen(PORT, () => {
  console.log(`Gramps Web Lite server running on http://localhost:${PORT}`)
})
