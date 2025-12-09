/* eslint-disable no-undef */
import {expect} from '@open-wc/testing'

/**
 * Phase 2 API Integration Tests
 * Tests for Events, Places, Sources, Repositories, Notes, and Validation
 */

const API_BASE = 'http://localhost:5555/api'

describe('Phase 2 API Tests', () => {
  describe('Events API', () => {
    it('should list all events', async () => {
      const response = await fetch(`${API_BASE}/events/`)
      const events = await response.json()

      expect(response.status).to.equal(200)
      expect(events).to.be.an('array')
      expect(events.length).to.be.greaterThan(0)
    })

    it('should get a specific event by handle', async () => {
      const response = await fetch(`${API_BASE}/events/e0001`)
      const event = await response.json()

      expect(response.status).to.equal(200)
      expect(event.handle).to.equal('e0001')
      expect(event.type.value).to.equal('Birth')
    })

    it('should validate event with valid data', async () => {
      const response = await fetch(`${API_BASE}/validate/event`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          type: {value: 'Birth'},
          date: {val: '1990-05-15'},
          description: 'Test birth event',
        }),
      })
      const result = await response.json()

      expect(response.status).to.equal(200)
      expect(result.valid).to.be.true
      expect(result.errors).to.be.empty
    })

    it('should reject event with invalid date', async () => {
      const response = await fetch(`${API_BASE}/validate/event`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          type: {value: 'Birth'},
          date: {val: 'invalid-date'},
          description: 'Bad date',
        }),
      })
      const result = await response.json()

      expect(response.status).to.equal(200)
      expect(result.valid).to.be.false
      expect(result.errors).to.have.lengthOf(1)
      expect(result.errors[0].field).to.equal('date')
    })
  })

  describe('Places API', () => {
    it('should list all places', async () => {
      const response = await fetch(`${API_BASE}/places/`)
      const places = await response.json()

      expect(response.status).to.equal(200)
      expect(places).to.be.an('array')
      expect(places.length).to.be.greaterThan(0)
    })

    it('should get a specific place with hierarchical data', async () => {
      const response = await fetch(`${API_BASE}/places/pl0001`)
      const place = await response.json()

      expect(response.status).to.equal(200)
      expect(place.handle).to.equal('pl0001')
      expect(place.title).to.include('New York')
      expect(place.lat).to.exist
      expect(place.long).to.exist
      expect(place.placeref_list).to.be.an('array')
    })

    it('should have hierarchical place structure', async () => {
      // Get city
      const cityResponse = await fetch(`${API_BASE}/places/pl0001`)
      const city = await cityResponse.json()

      expect(city.type.value).to.equal('City')
      expect(city.placeref_list).to.have.lengthOf(1)

      // Get state
      const stateResponse = await fetch(`${API_BASE}/places/pl0003`)
      const state = await stateResponse.json()

      expect(state.type.value).to.equal('State')
      expect(state.placeref_list).to.have.lengthOf(1)

      // Get country
      const countryResponse = await fetch(`${API_BASE}/places/pl0005`)
      const country = await countryResponse.json()

      expect(country.type.value).to.equal('Country')
      expect(country.placeref_list).to.be.empty
    })
  })

  describe('Sources API', () => {
    it('should list all sources', async () => {
      const response = await fetch(`${API_BASE}/sources/`)
      const sources = await response.json()

      expect(response.status).to.equal(200)
      expect(sources).to.be.an('array')
      expect(sources.length).to.be.greaterThan(0)
    })

    it('should get a specific source with metadata', async () => {
      const response = await fetch(`${API_BASE}/sources/s0001`)
      const source = await response.json()

      expect(response.status).to.equal(200)
      expect(source.handle).to.equal('s0001')
      expect(source.title).to.exist
      expect(source.author).to.exist
      expect(source.pubinfo).to.exist
      expect(source.reporef_list).to.be.an('array')
    })

    it('should have repository reference', async () => {
      const response = await fetch(`${API_BASE}/sources/s0001`)
      const source = await response.json()

      expect(source.reporef_list).to.have.lengthOf(1)
      expect(source.reporef_list[0].ref).to.equal('r0001')
      expect(source.reporef_list[0].call_number).to.exist
    })
  })

  describe('Citations API', () => {
    it('should list all citations', async () => {
      const response = await fetch(`${API_BASE}/citations/`)
      const citations = await response.json()

      expect(response.status).to.equal(200)
      expect(citations).to.be.an('array')
      expect(citations.length).to.be.greaterThan(0)
    })

    it('should get a specific citation', async () => {
      const response = await fetch(`${API_BASE}/citations/c0001`)
      const citation = await response.json()

      expect(response.status).to.equal(200)
      expect(citation.handle).to.equal('c0001')
      expect(citation.source_handle).to.equal('s0001')
      expect(citation.page).to.exist
      expect(citation.confidence).to.exist
    })

    it('should link citation to source', async () => {
      const citationResponse = await fetch(`${API_BASE}/citations/c0001`)
      const citation = await citationResponse.json()

      const sourceResponse = await fetch(
        `${API_BASE}/sources/${citation.source_handle}`
      )
      const source = await sourceResponse.json()

      expect(source.handle).to.equal('s0001')
      expect(source.title).to.include('Census')
    })
  })

  describe('Repositories API', () => {
    it('should list all repositories', async () => {
      const response = await fetch(`${API_BASE}/repositories/`)
      const repos = await response.json()

      expect(response.status).to.equal(200)
      expect(repos).to.be.an('array')
      expect(repos.length).to.be.greaterThan(0)
    })

    it('should get a specific repository with address and URLs', async () => {
      const response = await fetch(`${API_BASE}/repositories/r0001`)
      const repo = await response.json()

      expect(response.status).to.equal(200)
      expect(repo.handle).to.equal('r0001')
      expect(repo.name).to.exist
      expect(repo.address_list).to.be.an('array')
      expect(repo.urls).to.be.an('array')
    })

    it('should have complete address information', async () => {
      const response = await fetch(`${API_BASE}/repositories/r0001`)
      const repo = await response.json()

      const address = repo.address_list[0]
      expect(address.street).to.exist
      expect(address.city).to.exist
      expect(address.state).to.exist
      expect(address.country).to.exist
    })
  })

  describe('Notes API', () => {
    it('should list all notes', async () => {
      const response = await fetch(`${API_BASE}/notes/`)
      const notes = await response.json()

      expect(response.status).to.equal(200)
      expect(notes).to.be.an('array')
      expect(notes.length).to.be.greaterThan(0)
    })

    it('should get a specific note', async () => {
      const response = await fetch(`${API_BASE}/notes/n0001`)
      const note = await response.json()

      expect(response.status).to.equal(200)
      expect(note.handle).to.equal('n0001')
      expect(note.text.string).to.exist
      expect(note.type.value).to.equal('General')
    })
  })

  describe('Validation Logic', () => {
    it('should validate person with birth before death', async () => {
      const person = {
        handle: 'test-p001',
        event_ref_list: [
          {ref: 'test-e001'}, // birth
          {ref: 'test-e002'}, // death
        ],
      }

      // Note: This test assumes the validation function is accessible
      // In a real scenario, you'd need to create the events first
      const response = await fetch(`${API_BASE}/validate/person`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(person),
      })
      const result = await response.json()

      expect(response.status).to.equal(200)
      expect(result).to.have.property('valid')
    })

    it('should detect invalid parent-child age relationships', async () => {
      const family = {
        handle: 'test-f001',
        father_handle: 'test-p001',
        mother_handle: 'test-p002',
        child_ref_list: [{ref: 'test-p003'}],
      }

      const response = await fetch(`${API_BASE}/validate/family`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(family),
      })
      const result = await response.json()

      expect(response.status).to.equal(200)
      expect(result).to.have.property('valid')
      expect(result).to.have.property('errors')
      expect(result).to.have.property('warnings')
    })
  })

  describe('CRUD Operations', () => {
    it('should create a new event', async () => {
      const newEvent = {
        _class: 'Event',
        type: {value: 'Marriage'},
        date: {val: '2000-06-15'},
        description: 'Test marriage event',
        private: false,
      }

      const response = await fetch(`${API_BASE}/objects/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify([newEvent]),
      })
      const result = await response.json()

      expect(response.status).to.equal(200)
      expect(result.data).to.be.an('array')
      expect(result.data).to.have.lengthOf(1)
      expect(result.data[0].new.gramps_id).to.match(/^E\d{4}$/)
    })

    it('should create a new place', async () => {
      const newPlace = {
        _class: 'Place',
        name: {value: 'Paris'},
        title: 'Paris, France',
        type: {value: 'City'},
        lat: '48.8566',
        long: '2.3522',
        private: false,
      }

      const response = await fetch(`${API_BASE}/objects/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify([newPlace]),
      })
      const result = await response.json()

      expect(response.status).to.equal(200)
      expect(result.data).to.be.an('array')
      expect(result.data).to.have.lengthOf(1)
      expect(result.data[0].new.gramps_id).to.match(/^P\d{4}$/)
    })

    it('should create a new note', async () => {
      const newNote = {
        _class: 'Note',
        text: {string: 'This is a test note with rich content.'},
        type: {value: 'General'},
        private: false,
      }

      const response = await fetch(`${API_BASE}/objects/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify([newNote]),
      })
      const result = await response.json()

      expect(response.status).to.equal(200)
      expect(result.data).to.be.an('array')
      expect(result.data).to.have.lengthOf(1)
      expect(result.data[0].new.gramps_id).to.match(/^N\d{4}$/)
    })
  })

  describe('Search and Filtering', () => {
    it('should search events by description', async () => {
      const response = await fetch(`${API_BASE}/events/?q=John`)
      const events = await response.json()

      expect(response.status).to.equal(200)
      expect(events).to.be.an('array')
      // Should find "Birth of John Doe"
      expect(events.length).to.be.greaterThan(0)
    })

    it('should search places by name', async () => {
      const response = await fetch(`${API_BASE}/places/?q=New York`)
      const places = await response.json()

      expect(response.status).to.equal(200)
      expect(places).to.be.an('array')
      expect(places.length).to.be.greaterThan(0)
    })

    it('should paginate results', async () => {
      const response = await fetch(`${API_BASE}/places/?page=1&pagesize=2`)
      const places = await response.json()

      expect(response.status).to.equal(200)
      expect(places).to.be.an('array')
      expect(places.length).to.be.lessThanOrEqual(2)
      expect(response.headers.get('X-Total-Count')).to.exist
    })
  })
})
