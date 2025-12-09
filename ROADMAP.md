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

- [ ] **Clustered Map View:** A global map showing all events, clustered by region, expanding on zoom.
- [ ] **Migration Flows:** Animated curved lines connecting Birth -> Marriage -> Death locations to visualize migration patterns.
- [ ] **Historical Maps:** Overlay historical map tiles (e.g., 19th-century survey maps) over modern satellite imagery.
- [ ] **Geocoding Service:** Auto-suggest coordinates for place names and standardize place hierarchies.

## Phase 7: Temporal Analysis (Timelines)

**Goal:** Contextualize family history within world history.

- [ ] **Interactive Person Timeline:** A horizontal scrolling timeline showing a person's life events alongside historical context (wars, inventions, political changes).
- [ ] **Comparative Timelines:** Compare the lifespans and major events of multiple ancestors side-by-side.
- [ ] **Age Analysis:** Visualizations of life expectancy, age at marriage, and generation gaps over centuries.

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

- [ ] **Real-time Chat:** Enhanced chat with context awareness and full editing/drafting capabilities (linking directly to people/records in the chat).
- [ ] **Comments & Annotations:** Allow family members to comment on photos or stories without editing the core data.
- [ ] **Activity Feed:** A social-media style feed showing recent additions ("John added a photo of Great-Grandma").
- [ ] **Permissions System:** Granular privacy controls (e.g., "Private" records visible only to Editors, "Living" people hidden from Guests).

## Phase 10: UI/UX Overhaul (Modern Design System)

**Goal:** A beautiful, accessible, and mobile-first interface.

- [ ] **Design System:** Create a unified design language (colors, typography, components) using Tailwind CSS or Material 3.
- [ ] **Dark Mode:** First-class support for dark/light themes.
- [ ] **Mobile Experience:** A PWA (Progressive Web App) implementation that feels native on iOS and Android.
- [ ] **Accessibility:** WCAG 2.1 AA compliance to ensure the platform is usable by everyone, including elderly relatives.

## Phase 11: Performance, DevOps & Deployment

**Goal:** Enterprise-grade reliability and ease of deployment.

- [ ] **Dockerization:** Optimized multi-stage Docker builds for tiny image sizes.
- [ ] **Caching Strategy:** Redis caching for expensive queries (like relationship paths or large tree renders).
- [ ] **CI/CD Pipelines:** Automated testing (Unit, E2E) and deployment workflows.
- [ ] **Offline Mode:** Service Workers to allow viewing the tree even without an internet connection.

## Phase 12: Artificial Intelligence & Automation ("Smart Genealogy")

**Goal:** Leverage AI to automate tedious tasks and discover insights.

- [ ] **AI Biographer:** Use LLMs (like GPT-4 or local Llama) to generate narrative biographies from structured fact data.
- [ ] **Handwriting Recognition (OCR):** Automatically transcribe handwritten census records and letters uploaded to the media gallery.
- [ ] **Smart Hints:** Algorithmic suggestions for potential parents, missing events, or inconsistencies based on statistical models.
- [ ] **Face Recognition:** Automatically identify and tag family members across the entire photo library.
- [ ] **DNA Painter Integration:** Visualize chromosome segments and triangulate matches directly within the profile view.

## Phase 13: Advanced Administration & Governance

**Goal:** Powerful tools for site owners to manage data, users, and system health.

- [ ] **Audit Logs:** A tamper-proof history of every change made by every user (Who, What, When), with rollback capabilities.
- [ ] **Backup Scheduler:** Automated, encrypted backups to external cloud storage (S3, Google Drive) with retention policies.
- [ ] **Bulk Operations:** Tools for mass-tagging, find-and-replace, and merging duplicate places/sources.
- [ ] **System Health Dashboard:** Real-time monitoring of server load, database size, and error rates.
- [ ] **Approval Workflows:** A "Pull Request" system for genealogy—contributors submit changes, and editors review/approve them before they go live.
