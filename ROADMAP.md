# Gramps Web Evolution Roadmap

This roadmap outlines a comprehensive 10-phase plan to transform Gramps Web into a modern, high-performance, and feature-rich genealogy platform. The goal is to move from a "Lite" mock server to a robust, production-grade Node.js backend with a cutting-edge frontend experience.

## Phase 1: Foundation & Architecture Re-engineering

**Goal:** Establish a scalable, type-safe, and performant backend infrastructure.

- [x] **Backend Migration:** Formalize the transition from the Python backend to a full TypeScript/Node.js (NestJS or Express) architecture.
- [x] **Database Layer:** Move from `lowdb` (JSON files) to a robust SQL database (PostgreSQL or SQLite) with an ORM (Prisma or TypeORM) for complex relationship queries.
- [x] **API Standardization:** Define a strict OpenAPI (Swagger) specification for all endpoints to ensure type safety between frontend and backend.
- [x] **Authentication & Security:** Implement robust JWT-based auth, role-based access control (RBAC), and secure session management.

## Phase 2: Core Genealogy Data Management

**Goal:** Perfect the CRUD operations for the fundamental building blocks of genealogy.

**Status:** ✅ COMPLETE

- [x] **People:** Create, Read, Update, Delete (CRUD) for People.
- [x] **Families:** Link people as parents/children/spouses.
- [x] **Events:** Full support for Birth, Death, Marriage, Census, etc., with dates and places.
- [x] **Places:** Hierarchical place management (Country -> State -> City) with coordinates.
- [x] **Sources & Citations:** Rigorous academic sourcing (Source -> Citation -> Event).
- [x] **Repositories:** Managing archives and libraries.
- [x] **Notes:** Rich text notes attached to any object.
- [x] **Validation Logic:** Implement strict genealogical consistency checks (e.g., birth must be before death, children cannot be older than parents).

**Implementation Details:** See [docs/PHASE2.md](docs/PHASE2.md) for complete documentation.

## Phase 3: Data Portability & Interoperability

**Goal:** Ensure users can easily move data in and out of the system.

- [x] **GEDCOM 5.5.1 Import/Export:** Build a high-performance stream-based parser to import and export standard GEDCOM files.
- [x] **GEDCOM 7.0 Support:** Future-proof the platform with the latest standard (including Zip archives).
- [ ] **Gramps XML Support:** Maintain compatibility with the desktop Gramps XML format for lossless data transfer.
- [x] **CSV Import:** Allow bulk import of people/events via simple spreadsheets.

## Phase 4: Media Management & Digital Heritage

**Goal:** Create a rich media experience for photos, documents, and audio.

**Status:** 🚧 IN PROGRESS (Backend Complete)

- [x] **Media Gallery:** A modern grid layout with lazy loading, filtering, and sorting.
- [x] **Image Processing:** Automatic thumbnail generation, face detection, and tagging.
- [x] **Deep Zoom:** IIIF-compatible viewer for high-resolution document scans.
- [x] **Metadata Extraction:** Auto-extract EXIF/IPTC data (date taken, location) from uploaded photos to suggest Event details.

**Implementation Details:** See [PHASE4_IMPLEMENTATION.md](PHASE4_IMPLEMENTATION.md) for complete documentation.

**Backend Features (Complete):**

- ✅ Automatic thumbnail generation (3 sizes)
- ✅ EXIF/IPTC metadata extraction
- ✅ Event and place suggestions from metadata
- ✅ Face detection and tagging API
- ✅ IIIF Image API 3.0 manifests for deep zoom
- ✅ Enhanced gallery with filtering and sorting
- ✅ 8 new API endpoints

**Frontend Integration (Pending):**

- [ ] UI for gallery filters and sorting
- [ ] OpenSeadragon integration for deep zoom
- [ ] Face tagging UI
- [ ] Lazy loading implementation

## Phase 5: Interactive Visualizations & Charts

**Goal:** Bring family history to life with dynamic, interactive graphics.

**Status:** 🚧 IN PROGRESS (Backend Complete)

- [x] **Relationship Calculator:** Instant pathfinding algorithms to show exactly how two people are related (e.g., "3rd cousin twice removed").
- [x] **Optimized Chart Data APIs:** Backend endpoints for fan chart, tree chart, and descendant tree data
- [ ] **Canvas/WebGL Charts:** Rewrite heavy SVG charts using Canvas or WebGL (PixiJS) for rendering thousands of nodes smoothly.
- [ ] **Interactive Fan Chart:** A zoomable, clickable fan chart that acts as a navigation tool.
- [ ] **Fractal Tree:** A deep-zoom lineage view allowing users to explore generations seamlessly.
- [ ] **DNA Visualization:** Charts for Y-DNA and mtDNA haplogroups and autosomal matches.

**Implementation Details:** See [PHASE5_IMPLEMENTATION.md](PHASE5_IMPLEMENTATION.md) for complete documentation.

**Backend Features (Complete):**

- ✅ Relationship calculator with BFS pathfinding
- ✅ Human-readable relationship descriptions (e.g., "2nd cousin twice removed")
- ✅ Fan chart data API (configurable generations)
- ✅ Tree chart data API (mixed ancestors/descendants)
- ✅ Descendant tree data API
- ✅ 4 new API endpoints
- ✅ Mock server implementation

**Frontend Integration (Pending):**

- [ ] PixiJS or Canvas integration for high-performance rendering
- [ ] Interactive fan chart component
- [ ] Fractal tree with infinite zoom
- [ ] DNA visualization components
- [ ] Click navigation from charts

## Phase 6: Geospatial Intelligence (Maps)

**Goal:** Visualize the movement of ancestors across space and time.

**Status:** ✅ COMPLETE

- [x] **Clustered Map View:** A global map showing all events, clustered by region, expanding on zoom.
- [x] **Migration Flows:** Animated curved lines connecting Birth -> Marriage -> Death locations to visualize migration patterns.
- [x] **Historical Maps:** Overlay historical map tiles (e.g., 19th-century survey maps) over modern satellite imagery.
- [x] **Geocoding Service:** Auto-suggest coordinates for place names and standardize place hierarchies.

**Implementation Details:** See [PHASE6_IMPLEMENTATION.md](PHASE6_IMPLEMENTATION.md) for complete documentation.

## Phase 7: Temporal Analysis (Timelines)

**Goal:** Contextualize family history within world history.

**Status:** ✅ COMPLETE

- [x] **Interactive Person Timeline:** A horizontal scrolling timeline showing a person's life events alongside historical context (wars, inventions, political changes).
- [x] **Comparative Timelines:** Compare the lifespans and major events of multiple ancestors side-by-side.
- [x] **Age Analysis:** Visualizations of life expectancy, age at marriage, and generation gaps over centuries.

**Implementation Details:** See [PHASE7_IMPLEMENTATION.md](PHASE7_IMPLEMENTATION.md) for complete documentation.

**Features (Complete):**

- ✅ Person timeline with historical context integration
- ✅ Curated database of 40+ historical events (1800s-2020s)
- ✅ Comparative timeline visualization with lifespan bars
- ✅ Age analysis dashboard with multiple visualizations
- ✅ Gender-based statistical analysis
- ✅ Century distribution charts
- ✅ Lifespan distribution histogram
- ✅ 3 new API endpoints
- ✅ Interactive map integration for timeline events
- ✅ Material Design 3 styling with animations

## Phase 8: Data Quality, Advanced Indexing & Research Tools

**Goal:** Assist the researcher in cleaning data, finding records, and breaking through brick walls.

- [ ] **Advanced Search Engine:** Implement a dedicated search index (Elasticsearch or Meilisearch) supporting fuzzy matching, wildcards, and boolean operators.
- [ ] **Phonetic Indexing:** Index names using Soundex, Metaphone, and Double Metaphone to find ancestors with variant spellings.
- [ ] **Duplicate Detection:** Fuzzy matching algorithms to suggest potential duplicate people or places for merging.
- [ ] **Consistency Checker:** Automated reports flagging issues (e.g., "Mother was 8 years old at birth of child").
- [ ] **Data Quality Dashboard:** A visual overview of tree health (completeness scores, disconnected branches, potential errors).
- [ ] **Research Planner:** A Kanban-style board for tracking research tasks, to-dos, and correspondence.
- [ ] **Clipboard/Shoebox:** A temporary holding area for snippets of text or images found while researching.

## Phase 9: Collaboration & Social Features

**Goal:** Turn genealogy into a collaborative family activity.

**Status:** ✅ COMPLETE (Backend)

- [x] **Real-time Chat:** Enhanced chat with context awareness and full editing/drafting capabilities (linking directly to people/records in the chat).
- [x] **Comments & Annotations:** Allow family members to comment on photos or stories without editing the core data.
- [x] **Activity Feed:** A social-media style feed showing recent additions ("John added a photo of Great-Grandma").
- [x] **Permissions System:** Granular privacy controls (e.g., "Private" records visible only to Editors, "Living" people hidden from Guests).

**Implementation Details:** See [PHASE9_IMPLEMENTATION.md](PHASE9_IMPLEMENTATION.md) for complete documentation.

**Backend Features (Complete):**

- ✅ Real-time chat with context awareness
- ✅ Full editing and drafting capabilities for messages
- ✅ Comments and annotations on any record
- ✅ Threaded comment support
- ✅ Activity feed with social-media style display
- ✅ Granular privacy controls via visibility levels
- ✅ Role-based permissions (owner, editor, contributor, member)
- ✅ 12 new API endpoints
- ✅ Database migration

**Frontend Integration (Pending):**

- [ ] Chat UI components
- [ ] Comment widgets on record pages
- [ ] Activity feed dashboard
- [ ] Real-time updates (WebSocket or polling)
- [ ] Notification system

## Phase 10: UI/UX Overhaul (Modern Design System)

**Goal:** A beautiful, accessible, and mobile-first interface.

<<<<<<< HEAD
**Status:** 🚧 IN PROGRESS (Foundation Complete - 50% Complete)

**Completed:**

- [x] **Design System Foundation:** Comprehensive design tokens system (spacing, typography, colors, shadows, transitions, breakpoints)
- [x] **Accessibility Framework:** WCAG 2.1 AA compliance utilities (focus management, screen readers, keyboard navigation, color contrast)
- [x] **Responsive Design System:** Mobile-first utilities, 12-column grid, device detection, viewport management
- [x] **PWA Enhancement:** Service worker with offline mode, install prompts, update notifications, network detection
- [x] **Documentation:** Complete design system and implementation documentation (30KB+ of guides)

**In Progress:**

- [ ] **Component Library Enhancement:** Audit and update all 171+ components with design system
- [ ] **Phase 4 Frontend Integration:** Gallery filters, deep zoom viewer, face tagging UI, lazy loading
- [ ] **Performance Optimization:** Code splitting, bundle optimization, virtual scrolling
- [ ] **Visual Polish:** Enhanced animations, loading states, empty states, error messages
- [ ] **Testing:** Comprehensive UI tests, accessibility audits, cross-browser validation

**Files Created (12 files, ~100KB code + 30KB docs):**

- `src/design-tokens.js` - Design tokens (13.5KB)
- `src/accessibility.js` - Accessibility utilities (16.1KB)
- `src/responsive.js` - Responsive utilities (16.6KB)
- `src/pwa.js` - PWA utilities (10.9KB)
- `service-worker.js` - Service worker (8.6KB)
- `src/components/GrampsjsUpdateAvailableNew.js` - Update notification (6.5KB)
- `src/components/GrampsjsInstallPrompt.js` - Install prompt (6.5KB)
- `src/components/GrampsjsOfflineIndicator.js` - Offline indicator (5.6KB)
- `docs/PHASE10_DESIGN_SYSTEM.md` - Design system docs (15.5KB)
- `docs/PHASE10_IMPLEMENTATION.md` - Implementation summary (18KB)
- Updated: `src/SharedStyles.js`, `ROADMAP.md`

**Status:** ✅ COMPLETE

- [x] **Design System:** Create a unified design language (colors, typography, components) using Material 3.
- [x] **Dark Mode:** First-class support for dark/light/system themes with smooth transitions.
- [x] **Mobile Experience:** PWA (Progressive Web App) with offline support, install prompts, and touch gestures.
- [x] **Accessibility:** WCAG 2.1 AA compliance features including screen readers, keyboard navigation, and focus management.

**Implementation Details:** See [PHASE10_IMPLEMENTATION.md](PHASE10_IMPLEMENTATION.md) for complete documentation.

**Features Delivered:**

- ✅ Comprehensive design token system with utilities
- ✅ Enhanced theme management with persistence
- ✅ Service worker for offline support
- ✅ PWA install prompts and banners
- ✅ Accessibility utilities (screen reader, focus, keyboard nav)
- ✅ Mobile touch gestures (swipe, long press, pull-to-refresh)
- ✅ Responsive breakpoint utilities
- ✅ Theme preview component

**Next Steps:**

1. Update all components to use design tokens
2. Complete Phase 4 frontend features
3. Add performance optimizations
4. Implement visual polish
5. Comprehensive testing and audits

## Phase 11: Performance, DevOps & Deployment

**Goal:** Enterprise-grade reliability and ease of deployment.

**Status:** ✅ COMPLETE

- [x] **Dockerization:** Optimized multi-stage Docker builds for tiny image sizes.
- [x] **Caching Strategy:** Redis caching for expensive queries (like relationship paths or large tree renders).
- [x] **CI/CD Pipelines:** Automated testing (Unit, E2E) and deployment workflows.
- [x] **Offline Mode:** Service Workers to allow viewing the tree even without an internet connection.

**Implementation Details:** See [PHASE11_IMPLEMENTATION.md](PHASE11_IMPLEMENTATION.md) for complete documentation.

## Phase 12: Artificial Intelligence & Automation ("Smart Genealogy")

**Goal:** Leverage AI to automate tedious tasks and discover insights.

**Status:** ✅ COMPLETE

- [x] **AI Biographer:** Use LLMs (like GPT-4 or local Llama) to generate narrative biographies from structured fact data.
- [x] **Handwriting Recognition (OCR):** Automatically transcribe handwritten census records and letters uploaded to the media gallery.
- [x] **Smart Hints:** Algorithmic suggestions for potential parents, missing events, or inconsistencies based on statistical models.
- [x] **Face Recognition:** Automatically identify and tag family members across the entire photo library.
- [ ] **DNA Painter Integration:** Visualize chromosome segments and triangulate matches directly within the profile view.

**Implementation Details:** See [PHASE12_IMPLEMENTATION.md](PHASE12_IMPLEMENTATION.md) for complete documentation.

## Phase 13: Advanced Administration & Governance

**Goal:** Powerful tools for site owners to manage data, users, and system health.

**Status:** ✅ COMPLETE

- [x] **Audit Logs:** A tamper-proof history of every change made by every user (Who, What, When), with rollback capabilities.
- [x] **Backup Scheduler:** Automated, encrypted backups to external cloud storage (S3, Google Drive) with retention policies.
- [x] **Bulk Operations:** Tools for mass-tagging, find-and-replace, and merging duplicate places/sources.
- [x] **System Health Dashboard:** Real-time monitoring of server load, database size, and error rates.
- [x] **Approval Workflows:** A "Pull Request" system for genealogy—contributors submit changes, and editors review/approve them before they go live.

**Implementation Details:** See [PHASE13_IMPLEMENTATION.md](PHASE13_IMPLEMENTATION.md) and [PHASE13_SUMMARY.md](PHASE13_SUMMARY.md) for complete documentation.

## Phase 14: Polishing, Performance & Production Readiness

**Goal:** Ensure the platform is robust, fully tested, and performant at scale, while closing the gap between backend capabilities and frontend UI.

**Status:** 📅 PLANNED

- [ ] **Core Feature Parity (Missing Backend Modules):**
  - [ ] **Reporting Engine:** Implement a backend `ReportsModule` to generate PDF/ODT reports (Ahnentafel, Descendant, etc.) matching Gramps Desktop capabilities.
  - [ ] **DNA Backend:** Implement `DnaModule` to support storing and retrieving DNA matches (supporting the existing frontend views).
  - [ ] **Gramps XML Support:** Implement full lossless import/export of the native `.gramps` XML format (critical for desktop interoperability).
- [ ] **Frontend Feature Completion:**
  - [ ] **Deep Zoom UI:** Integrate OpenSeadragon for the IIIF-compatible media viewer (Phase 4).
  - [ ] **High-Performance Charts:** Implement Canvas/WebGL (PixiJS) rendering for large Fan Charts and Pedigree Trees (Phase 5).
  - [ ] **Real-Time Updates:** Implement WebSocket or polling mechanisms for Chat and Activity Feed (Phase 9).
  - [ ] **Face Tagging UI:** Frontend interface for the face detection API (Phase 4).
- [ ] **Testing & Quality Assurance:**
  - [ ] **Backend Test Coverage:** Achieve >80% unit test coverage (currently low).
  - [ ] **E2E Testing:** Fix and expand End-to-End test suites for critical user flows.
  - [ ] **Frontend Testing:** Implement comprehensive component tests using `@web/test-runner`.
- [ ] **Performance Optimization:**
  - [ ] **Database Query Tuning:** Optimize complex visualization queries (e.g., `visualizations.service.ts`).
  - [ ] **Virtual Scrolling:** Implement virtual lists for large datasets (People list, Media gallery).
  - [ ] **Bundle Optimization:** Analyze and reduce frontend bundle size.

## Phase 15: Legacy Compatibility & Advanced Science

**Goal:** Support long-time Gramps users and advanced genetic genealogy use cases.

**Status:** 📅 PLANNED

- [ ] **Advanced Visualizations:**
  - [ ] **Graph View:** Implement a force-directed graph visualization of the entire family tree.
  - [ ] **Calendar View:** A dedicated calendar view for birthdays, anniversaries, and historical events.
- [ ] **Narrative & Blogging:**
  - [ ] **Blog Backend:** Implement a `BlogModule` to support the narrative/blogging frontend views.
- [ ] **Advanced Tools:**
  - [ ] **Date Calculator:** Utility for complex date arithmetic (age between dates, day of week, etc.).
  - [ ] **DNA Painter Integration:** Visual chromosome mapping and triangulation tools (Phase 12).
- [ ] **Advanced Search Backend:** Evaluate migration to Meilisearch or Elasticsearch if the SQL-based search hits performance limits.
