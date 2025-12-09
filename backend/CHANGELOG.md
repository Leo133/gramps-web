# Changelog - Gramps Web Backend

All notable changes to the Gramps Web backend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-09

### Added - Phase 1 Implementation

#### Backend Infrastructure
- ✨ Full TypeScript/NestJS application architecture
- ✨ SQLite database with Prisma ORM (production-ready for PostgreSQL)
- ✨ Automatic database migrations with Prisma
- ✨ Database seeding script for development/testing
- ✨ Modular application structure for easy expansion

#### Authentication & Security
- ✨ JWT-based authentication with proper validation
- ✨ Refresh token support with database storage
- ✨ Token revocation capability
- ✨ bcrypt password hashing (10 rounds)
- ✨ 15-minute access token expiration
- ✨ 7-day refresh token expiration
- ✨ Secure session management

#### Authorization
- ✨ Role-Based Access Control (RBAC) with 4 tiers:
  - Owner: Full system access, user management
  - Editor: Edit all data, manage content
  - Contributor: Add and edit own contributions
  - Member: Read-only access
- ✨ Role hierarchy system
- ✨ Route-level authorization guards
- ✨ Method-level role decorators

#### API Endpoints
- ✨ `POST /api/token` - User login
- ✨ `POST /api/token/refresh` - Refresh access token
- ✨ `GET /api/users` - List users (Editor+)
- ✨ `POST /api/users` - Create user (Owner only)
- ✨ `PUT /api/users/:id` - Update user (Owner only)
- ✨ `DELETE /api/users/:id` - Delete user (Owner only)
- ✨ `GET /api/people` - List people with search & pagination
- ✨ `POST /api/people` - Create person (Contributor+)
- ✨ `GET /api/people/:handle` - Get person details
- ✨ `PUT /api/people/:handle` - Update person (Contributor+)
- ✨ `DELETE /api/people/:handle` - Delete person (Editor+)
- ✨ Similar CRUD endpoints for Families, Events, Places, Media, Repositories, Sources, Notes
- ✨ `GET /api/metadata` - System metadata (public)
- ✨ `GET /api/trees/-` - Tree settings
- ✨ `PUT /api/trees/-` - Update tree settings (Editor+)

#### API Documentation
- ✨ OpenAPI/Swagger specification
- ✨ Interactive API documentation at `/api/docs`
- ✨ Automatic endpoint documentation generation
- ✨ Request/response schema documentation
- ✨ Authentication flow documentation

#### Database Schema
- ✨ Users table with authentication fields
- ✨ RefreshTokens table for session management
- ✨ People table with genealogy data
- ✨ Families table with relationships
- ✨ Events table for life events
- ✨ Places table for locations
- ✨ Media table for files
- ✨ Repositories table for archives
- ✨ Sources table for citations
- ✨ Notes table for annotations
- ✨ Metadata table for system configuration
- ✨ TreeSettings table for user preferences
- ✨ AuditLog table for change tracking (infrastructure ready)
- ✨ JSON fields for complex nested data
- ✨ Proper foreign key relationships
- ✨ Database indexes for performance

#### Validation & Error Handling
- ✨ Global validation pipe with class-validator
- ✨ Request DTO validation
- ✨ Response transformation
- ✨ Comprehensive error messages
- ✨ HTTP status code handling
- ✨ Type-safe error responses

#### Development Experience
- ✨ Hot reload with watch mode
- ✨ TypeScript compilation
- ✨ ESLint configuration
- ✨ Prettier code formatting
- ✨ Environment variable configuration
- ✨ Comprehensive logging
- ✨ Graceful shutdown handling

#### Documentation
- ✨ Comprehensive README with quickstart guide
- ✨ Deployment guide with production setup
- ✨ Migration guide from old mock server
- ✨ API endpoint documentation
- ✨ Database schema documentation
- ✨ Security best practices
- ✨ Scaling guide
- ✨ Troubleshooting guide

#### Docker Support
- ✨ Multi-stage Dockerfile for production builds
- ✨ Docker Compose configuration
- ✨ Volume management for database persistence
- ✨ Health check configuration
- ✨ Environment variable configuration

#### Testing Infrastructure
- ✨ Jest testing framework setup
- ✨ E2E test configuration
- ✨ Sample authentication tests
- ✨ Test database setup
- ✨ Coverage reporting configuration

### Changed

#### From Mock Server
- 🔄 Migrated from Express.js to NestJS framework
- 🔄 Migrated from lowdb to Prisma ORM with SQLite/PostgreSQL
- 🔄 Replaced mock JWT with real authentication
- 🔄 Added TypeScript throughout
- 🔄 Implemented proper request validation
- 🔄 Added comprehensive error handling
- 🔄 Improved API response formats
- 🔄 Enhanced search capabilities
- 🔄 Added proper pagination

### Security

#### Implemented
- 🔐 Password hashing with bcrypt
- 🔐 JWT token validation
- 🔐 Token expiration enforcement
- 🔐 Refresh token rotation
- 🔐 CORS protection
- 🔐 Request validation and sanitization
- 🔐 Role-based authorization
- 🔐 Secure session management

#### Recommended for Production
- ⚠️ Change default JWT secrets
- ⚠️ Change default admin password
- ⚠️ Use HTTPS/TLS
- ⚠️ Implement rate limiting
- ⚠️ Set up database backups
- ⚠️ Use PostgreSQL in production
- ⚠️ Enable audit logging
- ⚠️ Implement monitoring

### Performance

#### Improvements
- ⚡ Database indexing on key fields
- ⚡ Efficient query optimization with Prisma
- ⚡ Connection pooling support
- ⚡ Type-safe database operations
- ⚡ Pagination for large datasets
- ⚡ Prepared statement caching

#### Future Optimizations
- 🚀 Redis caching (planned)
- 🚀 GraphQL support (planned)
- 🚀 WebSocket support (planned)
- 🚀 Full-text search (planned)

### Compatibility

#### Maintained
- ✅ API endpoint paths unchanged
- ✅ Request/response formats compatible
- ✅ JWT token structure compatible
- ✅ Frontend integration seamless

#### Enhanced
- 📈 Better error messages
- 📈 Improved validation
- 📈 More detailed API documentation
- 📈 Enhanced search capabilities

### Infrastructure

#### Ready for
- 🏗️ Horizontal scaling
- 🏗️ Load balancing
- 🏗️ Database replication
- 🏗️ Microservices architecture
- 🏗️ API versioning
- 🏗️ Multi-tenancy

### Known Issues

None at this time.

### Deprecated

- ❌ Old Express mock server (replaced)
- ❌ lowdb JSON file database (replaced)
- ❌ Mock JWT tokens (replaced)

### Removed

Nothing removed that affects functionality.

### Migration Notes

For existing installations:
1. Follow the [MIGRATION.md](./MIGRATION.md) guide
2. Backup existing data before migrating
3. Test migration in development first
4. Update frontend configuration if needed

### Contributors

- Implementation of Phase 1 specifications
- Aligned with Gramps Web Evolution Roadmap

### Roadmap Completion

**Phase 1: Foundation & Architecture Re-engineering**
- [x] Backend Migration
- [x] Database Layer
- [x] API Standardization
- [x] Authentication & Security

**Ready for Phase 2:** Core Genealogy Data Management
