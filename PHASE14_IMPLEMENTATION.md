# Phase 14: Polishing, Performance & Production Readiness - Implementation Guide

This document describes the implementation plan for Phase 14 features for Gramps Web, focusing on production readiness, feature parity, testing, and performance optimization.

## Overview

Phase 14 is about closing the gap between backend capabilities and frontend UI, ensuring the platform is robust, fully tested, and performant at scale. This phase addresses missing backend modules, completes frontend features, improves test coverage, and optimizes performance.

## Implementation Status

### Core Feature Parity (Missing Backend Modules)

#### 1. Reporting Engine (Backend)
**Status:** 📅 Planned for implementation

**Goal:** Implement a backend `ReportsModule` to generate PDF/ODT reports matching Gramps Desktop capabilities.

**Reports to Support:**
- **Ahnentafel Report:** Ancestor numbering system (1, 2, 3, 4...)
- **Descendant Report:** Multiple numbering systems (Register, NGSQ, Henry, d'Aboville)
- **Pedigree Chart:** Traditional ancestor tree visualization
- **Family Group Sheet:** Detailed family unit reports
- **Custom Reports:** Configurable templates

**Technical Approach:**
- Create `backend/src/reports/` module using NestJS
- Use PDFKit or similar library for PDF generation
- Use libreoffice-convert for ODT generation
- Implement report templates system
- Add privacy filtering (living vs deceased)
- Support multiple output formats (PDF, ODT, HTML)

**API Endpoints:**
```typescript
POST /api/reports/generate
GET /api/reports/:id/download
GET /api/reports/templates
DELETE /api/reports/:id
```

#### 2. DNA Backend Module
**Status:** 📅 Planned for implementation

**Goal:** Implement `DnaModule` to support storing and retrieving DNA matches.

**Features:**
- Store DNA test results
- Manage DNA matches
- Link DNA matches to people in the tree
- Support multiple DNA test providers (Ancestry, 23andMe, MyHeritage, etc.)
- Chromosome browser data storage
- Shared segment visualization data

**Technical Approach:**
- Create `backend/src/dna/` module using NestJS
- Design Prisma schema for DNA data
- Implement CRUD operations for DNA matches
- Add DNA match import from CSV/GEDCOM
- Support triangulation data

**API Endpoints:**
```typescript
POST /api/dna/tests
GET /api/dna/tests/:id
POST /api/dna/matches
GET /api/dna/matches
PUT /api/dna/matches/:id
DELETE /api/dna/matches/:id
```

#### 3. Gramps XML Support
**Status:** 📅 Planned for implementation

**Goal:** Implement full lossless import/export of the native `.gramps` XML format.

**Features:**
- Import Gramps XML files
- Export to Gramps XML format
- Preserve all Gramps-specific metadata
- Handle compressed .gramps files (gzip)
- Support for all Gramps object types
- Round-trip compatibility testing

**Technical Approach:**
- Create `backend/src/gramps-xml/` module
- Implement XML parser using fast-xml-parser
- Map Gramps XML schema to Prisma models
- Handle media file extraction from compressed archives
- Implement incremental sync for updates

**API Endpoints:**
```typescript
POST /api/importers/gramps-xml/file
POST /api/exporters/gramps-xml/file
GET /api/importers/gramps-xml/status/:jobId
```

### Frontend Feature Completion

#### 4. Deep Zoom UI (OpenSeadragon Integration)
**Status:** 📅 Planned

**Goal:** Integrate OpenSeadragon for the IIIF-compatible media viewer.

**Implementation:**
- Install OpenSeadragon package
- Create OpenSeadragon component wrapper
- Integrate with existing IIIF manifest endpoint
- Add zoom controls and navigation
- Implement touch gestures for mobile

**Files to Modify:**
- `src/components/MediaViewer.js`
- Create `src/components/DeepZoomViewer.js`

#### 5. High-Performance Charts (Canvas/WebGL)
**Status:** 📅 Planned

**Goal:** Implement Canvas/WebGL rendering for large Fan Charts and Pedigree Trees.

**Implementation:**
- Integrate PixiJS for WebGL rendering
- Rewrite SVG charts to use Canvas
- Implement viewport culling for performance
- Add progressive rendering for large trees
- Optimize layout algorithms

**Files to Modify:**
- `src/charts/FanChart.js`
- `src/charts/PedigreeChart.js`

#### 6. Real-Time Updates
**Status:** 📅 Planned

**Goal:** Implement WebSocket or polling mechanisms for Chat and Activity Feed.

**Backend:**
- Add WebSocket gateway using NestJS
- Implement room-based messaging
- Add presence detection

**Frontend:**
- Create WebSocket service
- Update Chat component
- Update Activity Feed component

#### 7. Face Tagging UI
**Status:** 📅 Planned

**Goal:** Frontend interface for the face detection API (Phase 4).

**Implementation:**
- Create face tagging modal
- Draw face bounding boxes on images
- Person selection for tagging
- Save tags via existing API

### Testing & Quality Assurance

#### 8. Backend Test Coverage
**Status:** 📅 Planned

**Goal:** Achieve >80% unit test coverage.

**Current State:** Test coverage is currently low
**Target:** >80% coverage

**Approach:**
- Add unit tests for all services
- Add integration tests for controllers
- Use Jest for testing framework
- Mock Prisma client for tests
- Add test coverage reporting

**Files to Create:**
- `backend/src/**/*.spec.ts`

#### 9. E2E Testing
**Status:** 📅 Planned

**Goal:** Fix and expand End-to-End test suites for critical user flows.

**Test Scenarios:**
- User registration and login
- Creating and editing people
- Adding families and relationships
- Uploading media
- Importing/exporting GEDCOM
- Generating reports

**Tools:**
- Playwright or Cypress
- Existing `@web/test-runner` setup

#### 10. Frontend Testing
**Status:** 📅 Planned

**Goal:** Implement comprehensive component tests using `@web/test-runner`.

**Coverage:**
- All major components
- User interaction flows
- State management
- API integration

### Performance Optimization

#### 11. Database Query Tuning
**Status:** 📅 Planned

**Goal:** Optimize complex visualization queries.

**Approach:**
- Add database indexes
- Use query explain plans
- Optimize N+1 queries
- Add database query logging
- Implement query result caching

**Files to Optimize:**
- `backend/src/visualizations/visualizations.service.ts`
- Other service files with complex queries

#### 12. Virtual Scrolling
**Status:** 📅 Planned

**Goal:** Implement virtual lists for large datasets.

**Implementation:**
- Use `lit-virtualizer` for web components
- Implement virtual scrolling in:
  - People list
  - Media gallery
  - Search results
  - Event lists

#### 13. Bundle Optimization
**Status:** 📅 Planned

**Goal:** Analyze and reduce frontend bundle size.

**Approach:**
- Run webpack bundle analyzer
- Implement code splitting
- Lazy load routes
- Tree shake unused code
- Optimize images and assets
- Use dynamic imports

## Implementation Priority

### Phase 1: Critical Backend Modules (Weeks 1-2)
1. Gramps XML Support (highest priority for desktop interoperability)
2. Reporting Engine (core feature parity)
3. DNA Backend Module

### Phase 2: Testing Infrastructure (Weeks 3-4)
4. Backend test coverage
5. E2E testing setup
6. Frontend testing

### Phase 3: Frontend Completion (Weeks 5-6)
7. Deep Zoom UI
8. Face Tagging UI
9. High-Performance Charts

### Phase 4: Performance (Weeks 7-8)
10. Database query tuning
11. Virtual scrolling
12. Bundle optimization
13. Real-time updates

## Success Criteria

- ✅ All backend modules implemented and tested
- ✅ Frontend feature parity achieved
- ✅ >80% backend test coverage
- ✅ E2E tests covering all critical flows
- ✅ All frontend components tested
- ✅ Database queries optimized
- ✅ Virtual scrolling implemented
- ✅ Bundle size reduced by >30%

## Testing Strategy

### Unit Tests
```bash
# Backend
cd backend
npm test

# Frontend
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Performance Testing
```bash
# Lighthouse scores
npm run lighthouse

# Bundle analysis
npm run analyze
```

## Production Deployment Checklist

- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Database migrations tested
- [ ] Environment variables documented
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] User guide created
- [ ] Backup and restore tested

## Dependencies

### Backend
```json
{
  "pdfkit": "^0.13.0",
  "fast-xml-parser": "^4.3.0",
  "socket.io": "^4.6.0",
  "@nestjs/websockets": "^10.0.0"
}
```

### Frontend
```json
{
  "openseadragon": "^4.1.0",
  "pixi.js": "^7.3.0",
  "lit-virtualizer": "^2.0.0"
}
```

## Notes

This is a comprehensive phase that will take multiple weeks to complete. Each sub-task should be implemented incrementally and tested thoroughly before moving to the next.

The priority is on backend feature parity and testing infrastructure, as these are foundational for a production-ready application.
