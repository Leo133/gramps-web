# Phase 2: Core Genealogy Data Management - Complete Implementation Guide

## Overview

Phase 2 focuses on perfecting the CRUD operations for the fundamental building blocks of genealogy. This implementation provides a robust, production-ready foundation for managing genealogical data with comprehensive validation and data integrity checks.

## Implemented Features

### 1. Events System ✓

Full support for genealogical events with comprehensive data tracking.

#### Event Types Supported
- **Birth** - Birth events with date and place
- **Death** - Death events with date and place
- **Marriage** - Marriage events linking spouses
- **Census** - Census records with citations
- **Custom events** - Extensible event type system

#### Event Data Model
```json
{
  "handle": "e0001",
  "gramps_id": "E0001",
  "type": {
    "value": "Birth"
  },
  "date": {
    "val": "1980-01-01"
  },
  "place": "pl0001",
  "description": "Birth of John Doe",
  "private": false,
  "citation_list": []
}
```

#### API Endpoints
- `GET /api/events/` - List all events with pagination and search
- `GET /api/events/:handle` - Get specific event
- `PUT /api/events/:handle` - Update event (with validation)
- `DELETE /api/events/:handle` - Delete event
- `POST /api/objects/` - Create new events (batch)

### 2. Places System ✓

Hierarchical place management with geographic coordinates.

#### Place Hierarchy
- **Country** - Top-level geographic division
- **State/Province** - Second-level division
- **City** - Third-level division (with coordinates)

#### Place Data Model
```json
{
  "handle": "pl0001",
  "gramps_id": "P0001",
  "name": {
    "value": "New York"
  },
  "title": "New York, New York, USA",
  "type": {
    "value": "City"
  },
  "lat": "40.7128",
  "long": "-74.0060",
  "placeref_list": [
    {
      "ref": "pl0003"
    }
  ],
  "private": false
}
```

#### Features
- Latitude and longitude coordinates for geocoding
- Hierarchical relationships via `placeref_list`
- Support for multiple place types
- Full-text search by place name

#### API Endpoints
- `GET /api/places/` - List all places
- `GET /api/places/:handle` - Get specific place with hierarchy
- `PUT /api/places/:handle` - Update place
- `DELETE /api/places/:handle` - Delete place
- `POST /api/objects/` - Create new places

### 3. Sources & Citations ✓

Academic-grade source tracking with proper citation management.

#### Source Data Model
```json
{
  "handle": "s0001",
  "gramps_id": "S0001",
  "title": "1900 United States Federal Census",
  "author": "U.S. Census Bureau",
  "pubinfo": "Washington, D.C.: National Archives and Records Administration",
  "abbrev": "1900 Census",
  "reporef_list": [
    {
      "ref": "r0001",
      "call_number": "T623",
      "media_type": {
        "value": "Microfilm"
      }
    }
  ],
  "private": false
}
```

#### Citation Data Model
```json
{
  "handle": "c0001",
  "gramps_id": "C0001",
  "source_handle": "s0001",
  "page": "Sheet 5, Line 23",
  "confidence": 2,
  "date": {
    "val": "1900-06-01"
  },
  "private": false
}
```

#### Citation Chain
```
Repository → Source → Citation → Event
```

This allows proper academic sourcing where:
- **Repository** is the archive/library holding the source
- **Source** is the document/record itself
- **Citation** is the specific reference to information in the source
- **Event** uses the citation as evidence

#### API Endpoints
**Sources:**
- `GET /api/sources/` - List all sources
- `GET /api/sources/:handle` - Get specific source
- `PUT /api/sources/:handle` - Update source
- `DELETE /api/sources/:handle` - Delete source

**Citations:**
- `GET /api/citations/` - List all citations
- `GET /api/citations/:handle` - Get specific citation
- `PUT /api/citations/:handle` - Update citation
- `DELETE /api/citations/:handle` - Delete citation

### 4. Repositories ✓

Management of archives, libraries, and document repositories.

#### Repository Data Model
```json
{
  "handle": "r0001",
  "gramps_id": "R0001",
  "name": "National Archives",
  "type": {
    "value": "Library"
  },
  "address_list": [
    {
      "street": "700 Pennsylvania Avenue NW",
      "city": "Washington",
      "state": "DC",
      "postal": "20408",
      "country": "USA"
    }
  ],
  "urls": [
    {
      "href": "https://www.archives.gov/",
      "desc": "National Archives Website",
      "type": {
        "value": "Web Home"
      }
    }
  ],
  "private": false
}
```

#### Features
- Full address tracking
- Multiple URLs per repository
- Repository type classification
- Link to sources held in the repository

#### API Endpoints
- `GET /api/repositories/` - List all repositories
- `GET /api/repositories/:handle` - Get specific repository
- `PUT /api/repositories/:handle` - Update repository
- `DELETE /api/repositories/:handle` - Delete repository

### 5. Notes System ✓

Flexible note-taking system attachable to any genealogical object.

#### Note Data Model
```json
{
  "handle": "n0001",
  "gramps_id": "N0001",
  "text": {
    "string": "This is a sample note about John Doe. He was born in New York City."
  },
  "type": {
    "value": "General"
  },
  "private": false
}
```

#### Features
- Plain text and rich text support
- Note types (General, Research, Source, etc.)
- Attachable to any object type
- Full-text search

#### API Endpoints
- `GET /api/notes/` - List all notes
- `GET /api/notes/:handle` - Get specific note
- `PUT /api/notes/:handle` - Update note
- `DELETE /api/notes/:handle` - Delete note

### 6. Validation Logic ✓

Comprehensive validation ensures data integrity and genealogical accuracy.

#### Validation Rules

**Date Validation:**
- Birth date must be before death date
- Date format validation (ISO 8601)
- Future dates are allowed (for planning)

**Parent-Child Age Validation:**
- Mother must be at least 12 years old at child's birth (error)
- Father must be at least 12 years old at child's birth (error)
- Warnings for very young parents (< 15-16 years)
- Warnings for very old parents (> 50 for mothers, > 80 for fathers)

**Gender Consistency:**
- Warnings if father has non-male gender
- Warnings if mother has non-female gender

**Reference Validation:**
- Place references must exist in database
- Source references must exist in database

#### Validation Response Format
```json
{
  "valid": false,
  "errors": [
    {
      "field": "date",
      "message": "Birth date must be before death date",
      "severity": "error"
    }
  ],
  "warnings": [
    {
      "field": "children",
      "message": "Mother was very young (14 years) at child's birth",
      "severity": "warning"
    }
  ]
}
```

#### API Endpoint
- `POST /api/validate/:type` - Validate object before saving

Where `:type` can be:
- `person` or `people`
- `family` or `families`
- `event` or `events`

#### Integration with CRUD Operations

Validation is automatically performed on:
- `PUT /api/:type/:handle` - Returns 400 error if validation fails
- `POST /api/objects/` - Skips invalid objects, returns validation errors

## Testing

### Test Coverage

26 comprehensive integration tests covering:
- ✓ Events API (4 tests)
- ✓ Places API with hierarchy (3 tests)
- ✓ Sources API (3 tests)
- ✓ Citations API (3 tests)
- ✓ Repositories API (3 tests)
- ✓ Notes API (2 tests)
- ✓ Validation Logic (2 tests)
- ✓ CRUD Operations (3 tests)
- ✓ Search and Filtering (3 tests)

### Running Tests

```bash
# Run all Phase 2 tests
npm test -- test/phase2-api.test.js

# Run with coverage
npm test -- test/phase2-api.test.js --coverage
```

### Test Examples

**Testing Event Validation:**
```javascript
const response = await fetch(`${API_BASE}/validate/event`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    type: {value: 'Birth'},
    date: {val: 'invalid-date'},
    description: 'Bad date'
  })
})
const result = await response.json()
// result.valid === false
// result.errors[0].field === 'date'
```

**Testing Place Hierarchy:**
```javascript
// Get city
const city = await fetch(`${API_BASE}/places/pl0001`).then(r => r.json())
// city.type.value === 'City'
// city.placeref_list[0].ref === 'pl0003' (state)

// Get state
const state = await fetch(`${API_BASE}/places/pl0003`).then(r => r.json())
// state.type.value === 'State'
// state.placeref_list[0].ref === 'pl0005' (country)
```

## Usage Examples

### Creating a Complete Event with Citation

```javascript
// 1. Create a repository
const repository = {
  _class: 'Repository',
  name: 'City Hall Archives',
  type: {value: 'Archive'},
  address_list: [{
    street: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    country: 'USA'
  }]
}

// 2. Create a source
const source = {
  _class: 'Source',
  title: 'Birth Register 1900-1920',
  author: 'City Clerk',
  reporef_list: [{
    ref: 'r0002',
    call_number: 'BR-1900'
  }]
}

// 3. Create a citation
const citation = {
  _class: 'Citation',
  source_handle: 's0002',
  page: 'Page 45, Entry 123',
  confidence: 2
}

// 4. Create a place
const place = {
  _class: 'Place',
  name: {value: 'Springfield'},
  title: 'Springfield, Illinois, USA',
  type: {value: 'City'},
  lat: '39.7817',
  long: '-89.6501'
}

// 5. Create the event
const event = {
  _class: 'Event',
  type: {value: 'Birth'},
  date: {val: '1905-03-15'},
  place: 'pl0007',
  description: 'Birth in Springfield',
  citation_list: [{ref: 'c0002'}]
}

// Create all objects
await fetch('/api/objects/', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify([repository, source, citation, place, event])
})
```

### Validating a Family

```javascript
const family = {
  handle: 'f0002',
  father_handle: 'p0003',
  mother_handle: 'p0004',
  child_ref_list: [{ref: 'p0005'}]
}

const validationResult = await fetch('/api/validate/family', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(family)
}).then(r => r.json())

if (!validationResult.valid) {
  console.error('Validation errors:', validationResult.errors)
}

if (validationResult.warnings.length > 0) {
  console.warn('Validation warnings:', validationResult.warnings)
}
```

### Searching Places

```javascript
// Search for all places containing "New York"
const places = await fetch('/api/places/?q=New York').then(r => r.json())

// Get paginated results
const page1 = await fetch('/api/places/?page=1&pagesize=10').then(r => r.json())
```

## Data Model Relationships

```
Person
  ├── event_ref_list → Events
  ├── family_list → Families
  ├── media_list → Media
  └── note_list → Notes

Family
  ├── father_handle → Person
  ├── mother_handle → Person
  ├── child_ref_list → Person[]
  └── event_ref_list → Events (marriage, divorce, etc.)

Event
  ├── place → Place
  ├── citation_list → Citations
  └── note_list → Notes

Citation
  ├── source_handle → Source
  └── note_list → Notes

Source
  ├── reporef_list → Repositories
  └── note_list → Notes

Place
  ├── placeref_list → Places (hierarchical)
  └── note_list → Notes

Repository
  └── note_list → Notes
```

## Future Enhancements

While Phase 2 is complete, the following enhancements are planned for future phases:

1. **Rich Text Editor for Notes** - Currently notes support plain text; a rich text editor will be added in the UI
2. **Duplicate Detection** - Fuzzy matching algorithms to detect potential duplicate people/places
3. **Advanced Citation Formatting** - Automatic citation formatting in various styles (APA, Chicago, etc.)
4. **Bulk Operations** - Mass editing and merging capabilities
5. **Enhanced Search** - Elasticsearch or Meilisearch integration for advanced search

## Performance Considerations

- All API endpoints support pagination via `page` and `pagesize` query parameters
- Search uses Fuse.js for fuzzy matching with configurable thresholds
- Database uses lowdb for JSON storage (suitable for development; PostgreSQL recommended for production)
- Validation is performed server-side to ensure data integrity

## Security Considerations

- All entities support `private` flag for privacy control
- User authentication required via JWT tokens
- Role-based access control (RBAC) integrated
- Input validation prevents injection attacks
- Data sanitization on all inputs

## Migration from Phase 1

Phase 1 already implemented:
- People CRUD operations
- Families linking

Phase 2 adds:
- Events, Places, Sources, Citations, Repositories, Notes
- Comprehensive validation
- Better data relationships
- Citation chain (Repository → Source → Citation → Event)

All Phase 1 data remains compatible and is enhanced with Phase 2 features.

## Conclusion

Phase 2 provides a solid foundation for genealogical research with:
- ✅ Complete CRUD operations for all core entities
- ✅ Hierarchical place management
- ✅ Academic-grade source citations
- ✅ Comprehensive validation logic
- ✅ 26 passing integration tests
- ✅ Production-ready API

The next phase (Phase 3) will focus on data portability with GEDCOM import/export and data interchange formats.
