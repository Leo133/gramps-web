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
        description: 'Birth of John Doe',
      },
    ],
    places: [],
    media: [],
    repositories: [],
    sources: [],
    notes: [],
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
      // Merge existing item with updates (or replace?)
      // Usually PUT replaces, but let's be safe and merge if needed,
      // though typically the frontend sends the full object.
      // However, we must preserve the handle and gramps_id if not provided (though they should be).

      db.data[type][index] = {...collection[index], ...updatedItem}
      await db.write()
      res.json(db.data[type][index])
    } else {
      res.status(404).json({error: 'Not found'})
    }
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

  for (const obj of objects) {
    const typeMap = {
      Person: 'people',
      Family: 'families',
      Event: 'events',
      Place: 'places',
      Media: 'media',
      Repository: 'repositories',
      Source: 'sources',
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

    // Add to DB
    if (!db.data[collectionName]) db.data[collectionName] = []
    db.data[collectionName].push(obj)

    createdObjects.push({new: obj})
  }

  await db.write()
  res.json({data: createdObjects})
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
