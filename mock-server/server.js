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
import multer from 'multer'
import {parseGedcom} from './gedcom-parser.js'
import {generateGedcom} from './gedcom-generator.js'
import {
  parseCsv,
  generateCsvTemplate,
  analyzeCsv,
  parseCsvWithMapping,
} from './csv-parser.js'
import {
  processMediaFile,
  detectFaces,
  generateIIIFManifest,
} from './media-processor.js'

const app = express()
const upload = multer({storage: multer.memoryStorage()})
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
        pubinfo:
          'Washington, D.C.: National Archives and Records Administration',
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
          string:
            'This is a sample note about John Doe. He was born in New York City.',
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
              message: `Father was too young (${Math.floor(
                ageAtBirth
              )} years) at child's birth`,
              severity: 'error',
            })
          } else if (ageAtBirth < 16) {
            warnings.push({
              field: 'children',
              message: `Father was very young (${Math.floor(
                ageAtBirth
              )} years) at child's birth`,
              severity: 'warning',
            })
          } else if (ageAtBirth > 80) {
            warnings.push({
              field: 'children',
              message: `Father was very old (${Math.floor(
                ageAtBirth
              )} years) at child's birth`,
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
              message: `Mother was too young (${Math.floor(
                ageAtBirth
              )} years) at child's birth`,
              severity: 'error',
            })
          } else if (ageAtBirth < 15) {
            warnings.push({
              field: 'children',
              message: `Mother was very young (${Math.floor(
                ageAtBirth
              )} years) at child's birth`,
              severity: 'warning',
            })
          } else if (ageAtBirth > 50) {
            warnings.push({
              field: 'children',
              message: `Mother was very old (${Math.floor(
                ageAtBirth
              )} years) at child's birth`,
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

// ==================== MEDIA PROCESSING (Phase 4) ====================

/**
 * Upload media with automatic processing
 * Generates thumbnails and extracts metadata
 */
app.post('/api/media/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({error: 'No file provided'})
    }

    const {buffer, originalname, mimetype} = req.file
    console.log(
      `Processing media upload: ${originalname} (${mimetype}, ${buffer.length} bytes)`
    )

    // Process the media file
    const processingResult = await processMediaFile(
      buffer,
      originalname,
      mimetype
    )

    // Generate unique gramps_id by finding max existing ID
    let maxId = 0
    if (db.data.media && db.data.media.length > 0) {
      db.data.media.forEach(m => {
        const match = m.gramps_id?.match(/^M(\d+)$/)
        if (match) {
          maxId = Math.max(maxId, parseInt(match[1], 10))
        }
      })
    }
    const newGrampsId = `M${String(maxId + 1).padStart(4, '0')}`

    // Create media object in database
    const mediaObject = {
      handle: processingResult.handle,
      gramps_id: newGrampsId,
      desc: originalname.replace(/\.[^/.]+$/, ''), // filename without extension
      path: `/uploads/${processingResult.handle}_${originalname}`,
      mime: mimetype,
      checksum: crypto.createHash('md5').update(buffer).digest('hex'),
      date: {
        modifier: 0,
        dateval: [0, 0, 0, false],
        sortval: 0,
      },
      attribute_list: [],
      citation_list: [],
      note_list: [],
      tag_list: [],
      private: false,
      change: Date.now(),
      // Phase 4 additions
      size: buffer.length,
      thumbnails: processingResult.thumbnails,
      metadata: processingResult.metadata,
      suggestions: processingResult.suggestions,
      faces: [],
    }

    // Initialize media array if it doesn't exist
    if (!db.data.media) {
      db.data.media = []
    }

    db.data.media.push(mediaObject)
    await db.write()

    return res.json({
      success: true,
      message: 'Media uploaded and processed successfully',
      data: mediaObject,
    })
  } catch (error) {
    console.error('Media upload error:', error)
    return res.status(500).json({error: error.message || 'Upload failed'})
  }
})

/**
 * Get thumbnail for a media object
 */
app.get('/api/media/:handle/thumbnail', async (req, res) => {
  const {handle} = req.params
  const {size = 'medium'} = req.query

  const mediaItem = (db.data.media || []).find(m => m.handle === handle)
  if (!mediaItem) {
    return res.status(404).json({error: 'Media not found'})
  }

  if (!mediaItem.thumbnails) {
    return res
      .status(404)
      .json({error: 'No thumbnails available for this media'})
  }

  const thumbnail = mediaItem.thumbnails[size]
  if (!thumbnail) {
    return res.status(400).json({error: `Invalid thumbnail size: ${size}`})
  }

  // In production, this would return the actual thumbnail image
  // For mock server, return thumbnail metadata
  return res.json({
    handle,
    size,
    thumbnail,
    url: `/api/media/${handle}/thumbnail/${size}`,
  })
})

/**
 * Extract metadata from media
 */
app.get('/api/media/:handle/metadata', async (req, res) => {
  const {handle} = req.params

  const mediaItem = (db.data.media || []).find(m => m.handle === handle)
  if (!mediaItem) {
    return res.status(404).json({error: 'Media not found'})
  }

  // Return stored metadata or extract fresh if not available
  if (mediaItem.metadata) {
    return res.json(mediaItem.metadata)
  }

  return res.json({
    error: 'No metadata available. Upload the file again to extract metadata.',
  })
})

/**
 * Detect faces in media
 */
app.post('/api/media/:handle/detect-faces', async (req, res) => {
  const {handle} = req.params

  const mediaItem = (db.data.media || []).find(m => m.handle === handle)
  if (!mediaItem) {
    return res.status(404).json({error: 'Media not found'})
  }

  if (!mediaItem.mime?.startsWith('image/')) {
    return res.status(400).json({error: 'Face detection only works on images'})
  }

  try {
    // Mock face detection - in production would analyze actual image
    const faces = await detectFaces(Buffer.from('mock'))

    // Store detected faces
    const index = db.data.media.findIndex(m => m.handle === handle)
    if (index !== -1) {
      db.data.media[index].faces = faces
      await db.write()
    }

    return res.json({
      success: true,
      faces,
      count: faces.length,
    })
  } catch (error) {
    console.error('Face detection error:', error)
    return res
      .status(500)
      .json({error: error.message || 'Face detection failed'})
  }
})

/**
 * Get faces for media
 */
app.get('/api/media/:handle/faces', async (req, res) => {
  const {handle} = req.params

  const mediaItem = (db.data.media || []).find(m => m.handle === handle)
  if (!mediaItem) {
    return res.status(404).json({error: 'Media not found'})
  }

  return res.json({
    faces: mediaItem.faces || [],
    count: (mediaItem.faces || []).length,
  })
})

/**
 * Update face tags (link faces to people)
 */
app.put('/api/media/:handle/faces/:faceId', async (req, res) => {
  const {handle, faceId} = req.params
  const {person_handle} = req.body

  const mediaIndex = (db.data.media || []).findIndex(m => m.handle === handle)
  if (mediaIndex === -1) {
    return res.status(404).json({error: 'Media not found'})
  }

  const faces = db.data.media[mediaIndex].faces || []
  const faceIndex = faces.findIndex(f => f.id === faceId)

  if (faceIndex === -1) {
    return res.status(404).json({error: 'Face not found'})
  }

  // Update face with person handle
  db.data.media[mediaIndex].faces[faceIndex].person_handle = person_handle
  await db.write()

  return res.json({
    success: true,
    face: db.data.media[mediaIndex].faces[faceIndex],
  })
})

/**
 * Get IIIF manifest for deep zoom
 */
app.get('/api/media/:handle/iiif', async (req, res) => {
  const {handle} = req.params

  const mediaItem = (db.data.media || []).find(m => m.handle === handle)
  if (!mediaItem) {
    return res.status(404).json({error: 'Media not found'})
  }

  if (!mediaItem.mime?.startsWith('image/')) {
    return res
      .status(400)
      .json({error: 'IIIF manifest only available for images'})
  }

  const imageInfo = {
    width: mediaItem.metadata?.exif?.width || 1024,
    height: mediaItem.metadata?.exif?.height || 768,
  }

  const manifest = generateIIIFManifest(handle, imageInfo)

  return res.json(manifest)
})

/**
 * Get media gallery with filtering and sorting
 */
app.get('/api/media/gallery', async (req, res) => {
  const {
    filter_type, // photo, document, audio, video
    sort = 'date', // date, name, size, type
    order = 'desc',
    page = 1,
    pagesize = 20,
  } = req.query

  let results = db.data.media || []

  // Filter by media type
  if (filter_type) {
    const typeMap = {
      photo: 'image/',
      document: 'application/',
      audio: 'audio/',
      video: 'video/',
    }
    const mimePrefix = typeMap[filter_type]
    if (mimePrefix) {
      results = results.filter(m => m.mime?.startsWith(mimePrefix))
    }
  }

  // Sort results
  results.sort((a, b) => {
    let comparison = 0
    switch (sort) {
      case 'date':
        comparison = (a.change || 0) - (b.change || 0)
        break
      case 'name':
        comparison = (a.desc || '').localeCompare(b.desc || '')
        break
      case 'size':
        comparison = (a.size || 0) - (b.size || 0)
        break
      case 'type':
        comparison = (a.mime || '').localeCompare(b.mime || '')
        break
      default:
        comparison = 0
    }
    return order === 'asc' ? comparison : -comparison
  })

  const totalCount = results.length
  const pageNum = parseInt(page, 10)
  const pageSizeNum = parseInt(pagesize, 10)
  const start = (pageNum - 1) * pageSizeNum
  const end = start + pageSizeNum
  const paginatedResults = results.slice(start, end)

  res.setHeader('X-Total-Count', totalCount)
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')

  return res.json({
    data: paginatedResults,
    total: totalCount,
    page: pageNum,
    pagesize: pageSizeNum,
  })
})

// Generic handler for other requests (logging)
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

// ==================== IMPORTERS ====================

// List available importers
app.get('/api/importers/', (req, res) => {
  res.json({
    data: [
      {
        extension: 'ged',
        name: 'GEDCOM',
        description:
          'Import GEDCOM 5.5.1 files - the standard format for genealogical data exchange.',
      },
      {
        extension: 'gedcom',
        name: 'GEDCOM 7.0',
        description:
          'Import GEDCOM 7.0 files - the latest GEDCOM standard with improved support for modern genealogy.',
      },
      {
        extension: 'gramps',
        name: 'Gramps XML',
        description:
          'Import Gramps XML files for lossless data transfer from Gramps Desktop.',
      },
      {
        extension: 'csv',
        name: 'CSV',
        description:
          'Import people and events from CSV spreadsheets. Download template for required format.',
      },
    ],
  })
})

// Analyze CSV file
app.post('/api/importers/csv/analyze', upload.single('file'), (req, res) => {
  const {file} = req
  if (!file) {
    return res.status(400).json({error: 'No file uploaded'})
  }

  try {
    const content = file.buffer.toString('utf-8')
    const analysis = analyzeCsv(content)
    if (analysis.error) {
      return res.status(400).json({error: analysis.error})
    }
    return res.json(analysis)
  } catch (error) {
    console.error('Analysis error:', error)
    return res.status(500).json({error: 'Analysis failed'})
  }
})

// Import file
app.post(
  '/api/importers/:format/file',
  upload.single('file'),
  async (req, res) => {
    const {format} = req.params
    const {file} = req

    if (!file) {
      return res.status(400).json({error: 'No file uploaded'})
    }

    console.log(
      `Import request for format: ${format}, file: ${file.originalname}`
    )

    try {
      const content = file.buffer.toString('utf-8')
      let importedData = null

      switch (format) {
        case 'ged':
          importedData = parseGedcom(content, '5.5.1')
          break
        case 'gedcom':
          importedData = parseGedcom(content, '7.0')
          break
        case 'csv':
          if (req.body.mapping) {
            try {
              const mapping = JSON.parse(req.body.mapping)
              importedData = parseCsvWithMapping(content, mapping)
            } catch (e) {
              console.error('Invalid mapping JSON:', e)
              importedData = parseCsv(content)
            }
          } else {
            importedData = parseCsv(content)
          }
          break
        case 'gramps':
          // For now, return error for unsupported XML format
          return res.status(400).json({
            error:
              'Gramps XML import is not yet implemented in the lite server. Please use GEDCOM format.',
          })
        default:
          return res.status(400).json({error: 'Unsupported format'})
      }

      if (!importedData) {
        return res.status(400).json({error: 'Failed to parse file'})
      }

      // Merge imported data into database
      if (importedData.people) {
        db.data.people = [...(db.data.people || []), ...importedData.people]
      }
      if (importedData.families) {
        db.data.families = [
          ...(db.data.families || []),
          ...importedData.families,
        ]
      }
      if (importedData.events) {
        db.data.events = [...(db.data.events || []), ...importedData.events]
      }
      if (importedData.places) {
        db.data.places = [...(db.data.places || []), ...importedData.places]
      }
      if (importedData.sources) {
        db.data.sources = [...(db.data.sources || []), ...importedData.sources]
      }
      if (importedData.repositories) {
        db.data.repositories = [
          ...(db.data.repositories || []),
          ...importedData.repositories,
        ]
      }
      if (importedData.notes) {
        db.data.notes = [...(db.data.notes || []), ...importedData.notes]
      }
      if (importedData.media) {
        db.data.media = [...(db.data.media || []), ...importedData.media]
      }

      await db.write()

      return res.json({
        success: true,
        message: `Successfully imported ${
          importedData.people?.length || 0
        } people, ${importedData.families?.length || 0} families`,
      })
    } catch (error) {
      console.error('Import error:', error)
      return res.status(500).json({error: error.message || 'Import failed'})
    }
  }
)

// Download CSV template
app.get('/api/importers/csv/template', (req, res) => {
  const template = generateCsvTemplate()
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="import-template.csv"'
  )
  res.send(template)
})

// ==================== EXPORTERS ====================

// List available exporters
app.get('/api/exporters/', (req, res) => {
  res.json({
    data: [
      {
        extension: 'ged',
        name: 'GEDCOM 5.5.1',
        description:
          'Export to GEDCOM 5.5.1 format - compatible with most genealogy software.',
      },
      {
        extension: 'gedcom',
        name: 'GEDCOM 7.0',
        description:
          'Export to GEDCOM 7.0 format - the latest standard with improved features.',
      },
      {
        extension: 'gramps',
        name: 'Gramps XML',
        description:
          'Export to Gramps XML format for lossless import into Gramps Desktop.',
      },
    ],
  })
})

// Export file
app.post('/api/exporters/:format/file', async (req, res) => {
  const {format} = req.params

  console.log(`Export request for format: ${format}`)

  try {
    let content = ''
    let filename = 'grampsweb-export'
    let mimeType = 'text/plain'

    switch (format) {
      case 'ged':
        content = generateGedcom(db.data, '5.5.1')
        filename = 'grampsweb-export.ged'
        mimeType = 'text/x-gedcom'
        break
      case 'gedcom':
        content = generateGedcom(db.data, '7.0')
        filename = 'grampsweb-export.gedcom'
        mimeType = 'text/x-gedcom'
        break
      case 'gramps':
        // For now, return error for unsupported XML format
        return res.status(400).json({
          error:
            'Gramps XML export is not yet implemented in the lite server. Please use GEDCOM format.',
        })
      default:
        return res.status(400).json({error: 'Unsupported format'})
    }

    // In a real implementation, this would save to a file and return a URL
    // For the mock server, we'll return the content directly as a base64 data URL
    const base64Content = Buffer.from(content).toString('base64')
    const dataUrl = `data:${mimeType};base64,${base64Content}`

    return res.json({
      data: {
        url: dataUrl,
        filename,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return res.status(500).json({error: error.message || 'Export failed'})
  }
})

// ========== VISUALIZATIONS API (Phase 5) ==========

// Helper functions for relationship calculation
function getPathNode(person, relationship = '') {
  const name = person?.primary_name
    ? `${person.primary_name.first_name || ''} ${
        person.primary_name.surname_list?.[0]?.surname || ''
      }`.trim()
    : 'Unknown'

  return {
    handle: person?.handle || '',
    gramps_id: person?.gramps_id || '',
    name,
    gender: person?.gender ?? 2,
    relationship,
  }
}

function getNeighbors(personHandle, dbData) {
  const neighbors = []

  // Get families where person is a child
  const childFamilies = dbData.families.filter(
    f => f.child_ref_list && f.child_ref_list.includes(personHandle)
  )

  for (const family of childFamilies) {
    if (family.father_handle) {
      const father = dbData.people.find(p => p.handle === family.father_handle)
      if (father) neighbors.push(getPathNode(father, 'parent'))
    }
    if (family.mother_handle) {
      const mother = dbData.people.find(p => p.handle === family.mother_handle)
      if (mother) neighbors.push(getPathNode(mother, 'parent'))
    }
  }

  // Get families where person is a parent
  const parentFamilies = dbData.families.filter(
    f => f.father_handle === personHandle || f.mother_handle === personHandle
  )

  for (const family of parentFamilies) {
    // Add spouse
    if (family.father_handle === personHandle && family.mother_handle) {
      const spouse = dbData.people.find(p => p.handle === family.mother_handle)
      if (spouse) neighbors.push(getPathNode(spouse, 'spouse'))
    } else if (family.mother_handle === personHandle && family.father_handle) {
      const spouse = dbData.people.find(p => p.handle === family.father_handle)
      if (spouse) neighbors.push(getPathNode(spouse, 'spouse'))
    }

    // Add children
    if (family.child_ref_list) {
      for (const childHandle of family.child_ref_list) {
        const child = dbData.people.find(p => p.handle === childHandle)
        if (child) neighbors.push(getPathNode(child, 'child'))
      }
    }
  }

  return neighbors
}

function findShortestPath(startHandle, endHandle, dbData) {
  const visited = new Map()
  const queue = []

  const startPerson = dbData.people.find(p => p.handle === startHandle)
  const startNode = getPathNode(startPerson)

  queue.push({handle: startHandle, path: [startNode]})
  visited.set(startHandle, true)

  while (queue.length > 0) {
    const {handle, path} = queue.shift()

    if (handle === endHandle) {
      return path
    }

    const neighbors = getNeighbors(handle, dbData)

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.handle)) {
        visited.set(neighbor.handle, true)
        queue.push({
          handle: neighbor.handle,
          path: [...path, neighbor],
        })
      }
    }
  }

  return [] // No path found
}

function getGenderTerm(gender, maleTerm, femaleTerm, unknownTerm) {
  if (gender === 1) return maleTerm
  if (gender === 0) return femaleTerm
  return unknownTerm
}

function analyzeRelationship(path) {
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
      const term = getGenderTerm(path[1].gender, 'Father', 'Mother', 'Parent')
      return {description: term, type: 'parent', commonAncestor: null}
    }
    if (rel === 'child') {
      const term = getGenderTerm(path[1].gender, 'Son', 'Daughter', 'Child')
      return {description: term, type: 'child', commonAncestor: null}
    }
    if (rel === 'spouse') {
      const term = getGenderTerm(path[1].gender, 'Husband', 'Wife', 'Spouse')
      return {description: term, type: 'spouse', commonAncestor: null}
    }
  }

  // Count steps
  let stepsUp = 0
  let stepsDown = 0
  let foundAncestor = false
  let commonAncestor = null

  for (let i = 1; i < path.length; i += 1) {
    if (path[i].relationship === 'parent' && !foundAncestor) {
      stepsUp += 1
    } else if (path[i].relationship === 'child') {
      foundAncestor = true
      stepsDown += 1
    }
  }

  if (stepsUp > 0 && !foundAncestor) {
    commonAncestor = path[stepsUp]
  }

  // Siblings
  if (stepsUp === 1 && stepsDown === 1) {
    const term = getGenderTerm(
      path[path.length - 1].gender,
      'Brother',
      'Sister',
      'Sibling'
    )
    return {description: term, type: 'sibling', commonAncestor}
  }

  // Direct ancestors
  if (stepsUp > 0 && stepsDown === 0) {
    let term
    if (stepsUp === 1) {
      term = getGenderTerm(
        path[path.length - 1].gender,
        'Father',
        'Mother',
        'Parent'
      )
    } else if (stepsUp === 2) {
      term = getGenderTerm(
        path[path.length - 1].gender,
        'Grandfather',
        'Grandmother',
        'Grandparent'
      )
    } else {
      const prefix = 'Great-'.repeat(stepsUp - 2)
      const base = getGenderTerm(
        path[path.length - 1].gender,
        'Grandfather',
        'Grandmother',
        'Grandparent'
      )
      term = prefix + base
    }
    return {description: term, type: 'ancestor', commonAncestor}
  }

  // Direct descendants
  if (stepsUp === 0 && stepsDown > 0) {
    let term
    if (stepsDown === 1) {
      term = getGenderTerm(
        path[path.length - 1].gender,
        'Son',
        'Daughter',
        'Child'
      )
    } else if (stepsDown === 2) {
      term = getGenderTerm(
        path[path.length - 1].gender,
        'Grandson',
        'Granddaughter',
        'Grandchild'
      )
    } else {
      const prefix = 'Great-'.repeat(stepsDown - 2)
      const base = getGenderTerm(
        path[path.length - 1].gender,
        'Grandson',
        'Granddaughter',
        'Grandchild'
      )
      term = prefix + base
    }
    return {description: term, type: 'descendant', commonAncestor}
  }

  // Cousins and aunts/uncles/nieces/nephews
  if (stepsUp > 0 && stepsDown > 0) {
    const degree = Math.min(stepsUp, stepsDown) - 1
    const removal = Math.abs(stepsUp - stepsDown)
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

    // Aunt/Uncle or Niece/Nephew relationships (degree = 0)
    if (degree === 0) {
      if (removal === 0) {
        // Sibling (should not reach here as it's handled above)
        return {description: 'Sibling', type: 'sibling', commonAncestor}
      }
      // stepsUp = steps going up from person1 to common ancestor
      // stepsDown = steps going down from common ancestor to person2
      // When stepsUp > stepsDown, person2 is in an older generation relative to person1
      if (stepsUp > stepsDown) {
        // Person2 is older generation (aunt/uncle)
        const prefix =
          removal > 1 ? `Great-${'Great-'.repeat(removal - 2)}` : ''
        const term = getGenderTerm(
          path[path.length - 1].gender,
          `${prefix}Uncle`,
          `${prefix}Aunt`,
          `${prefix}Aunt/Uncle`
        )
        return {description: term, type: 'in-law', commonAncestor}
      }
      // Person2 is younger generation (niece/nephew)
      const prefix = removal > 1 ? `Great-${'Great-'.repeat(removal - 2)}` : ''
      const term = getGenderTerm(
        path[path.length - 1].gender,
        `${prefix}Nephew`,
        `${prefix}Niece`,
        `${prefix}Niece/Nephew`
      )
      return {description: term, type: 'in-law', commonAncestor}
    }

    // Cousin relationships (degree > 0)
    const cousinType = `${ordinals[degree]} cousin`
    const term =
      removal === 0
        ? cousinType
        : `${cousinType}, ${removal} time${removal > 1 ? 's' : ''} removed`
    return {description: term, type: 'cousin', commonAncestor}
  }

  return {
    description: 'Distant relative',
    type: 'distant',
    commonAncestor,
  }
}

function buildAncestorTree(handle, generation, maxGenerations, dbData) {
  if (generation >= maxGenerations) {
    return null
  }

  const person = dbData.people.find(p => p.handle === handle)
  if (!person) {
    return null
  }

  // Get parent family
  const childFamilies = dbData.families.filter(
    f => f.child_ref_list && f.child_ref_list.includes(handle)
  )

  let father = null
  let mother = null

  if (childFamilies.length > 0) {
    const family = childFamilies[0]
    if (family.father_handle) {
      father = buildAncestorTree(
        family.father_handle,
        generation + 1,
        maxGenerations,
        dbData
      )
    }
    if (family.mother_handle) {
      mother = buildAncestorTree(
        family.mother_handle,
        generation + 1,
        maxGenerations,
        dbData
      )
    }
  }

  return {
    person,
    handle: person.handle,
    gramps_id: person.gramps_id,
    name: getPathNode(person).name,
    gender: person.gender,
    generation,
    children: [father, mother].filter(Boolean),
  }
}

function buildDescendantTree(handle, generation, maxGenerations, dbData) {
  if (generation >= maxGenerations) {
    return null
  }

  const person = dbData.people.find(p => p.handle === handle)
  if (!person) {
    return null
  }

  // Get families where person is a parent
  const families = dbData.families.filter(
    f => f.father_handle === handle || f.mother_handle === handle
  )

  const children = []
  for (const family of families) {
    if (family.child_ref_list) {
      for (const childHandle of family.child_ref_list) {
        const childTree = buildDescendantTree(
          childHandle,
          generation + 1,
          maxGenerations,
          dbData
        )
        if (childTree) {
          children.push(childTree)
        }
      }
    }
  }

  return {
    person,
    handle: person.handle,
    gramps_id: person.gramps_id,
    name: getPathNode(person).name,
    gender: person.gender,
    generation,
    children,
  }
}

/**
 * Calculate relationship between two people
 * POST /api/visualizations/calculate-relationship
 * Body: { person1Handle: string, person2Handle: string }
 */
app.post('/api/visualizations/calculate-relationship', async (req, res) => {
  try {
    const {person1Handle, person2Handle} = req.body

    if (!person1Handle || !person2Handle) {
      return res
        .status(400)
        .json({error: 'person1Handle and person2Handle are required'})
    }

    // Find both people
    const person1 = db.data.people.find(p => p.handle === person1Handle)
    const person2 = db.data.people.find(p => p.handle === person2Handle)

    if (!person1 || !person2) {
      return res.status(404).json({error: 'One or both people not found'})
    }

    // Special case: same person
    if (person1Handle === person2Handle) {
      return res.json({
        person1: getPathNode(person1),
        person2: getPathNode(person2),
        relationship: 'Self',
        commonAncestor: null,
        path: [getPathNode(person1)],
        distance: 0,
        relationshipType: 'self',
      })
    }

    // Find shortest path using BFS
    const path = findShortestPath(person1Handle, person2Handle, db.data)

    if (!path || path.length === 0) {
      return res.json({
        person1: getPathNode(person1),
        person2: getPathNode(person2),
        relationship: 'No known relationship',
        commonAncestor: null,
        path: [],
        distance: -1,
        relationshipType: 'distant',
      })
    }

    // Analyze relationship
    const analysis = analyzeRelationship(path)

    return res.json({
      person1: path[0],
      person2: path[path.length - 1],
      relationship: analysis.description,
      commonAncestor: analysis.commonAncestor,
      path,
      distance: path.length - 1,
      relationshipType: analysis.type,
    })
  } catch (error) {
    console.error('Relationship calculation error:', error)
    return res
      .status(500)
      .json({error: error.message || 'Failed to calculate relationship'})
  }
})

/**
 * Get fan chart data (ancestors)
 * GET /api/visualizations/fan-chart/:handle
 */
app.get('/api/visualizations/fan-chart/:handle', async (req, res) => {
  try {
    const {handle} = req.params
    const maxGenerations = parseInt(req.query.generations, 10) || 5

    const person = db.data.people.find(p => p.handle === handle)
    if (!person) {
      return res.status(404).json({error: 'Person not found'})
    }

    const chartData = buildAncestorTree(handle, 0, maxGenerations, db.data)
    return res.json(chartData)
  } catch (error) {
    console.error('Fan chart error:', error)
    return res
      .status(500)
      .json({error: error.message || 'Failed to get fan chart data'})
  }
})

/**
 * Get tree chart data (mixed)
 * GET /api/visualizations/tree-chart/:handle
 */
app.get('/api/visualizations/tree-chart/:handle', async (req, res) => {
  try {
    const {handle} = req.params
    const person = db.data.people.find(p => p.handle === handle)

    if (!person) {
      return res.status(404).json({error: 'Person not found'})
    }

    return res.json({
      person,
      ancestors: buildAncestorTree(handle, 0, 3, db.data),
      descendants: buildDescendantTree(handle, 0, 3, db.data),
    })
  } catch (error) {
    console.error('Tree chart error:', error)
    return res
      .status(500)
      .json({error: error.message || 'Failed to get tree chart data'})
  }
})

/**
 * Get descendant tree
 * GET /api/visualizations/descendant-tree/:handle
 */
app.get('/api/visualizations/descendant-tree/:handle', async (req, res) => {
  try {
    const {handle} = req.params
    const maxGenerations = parseInt(req.query.generations, 10) || 5

    const person = db.data.people.find(p => p.handle === handle)
    if (!person) {
      return res.status(404).json({error: 'Person not found'})
    }

    const chartData = buildDescendantTree(handle, 0, maxGenerations, db.data)
    return res.json(chartData)
  } catch (error) {
    console.error('Descendant tree error:', error)
    return res
      .status(500)
      .json({error: error.message || 'Failed to get descendant tree data'})
  }
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
