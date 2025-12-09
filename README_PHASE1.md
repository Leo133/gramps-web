# Gramps Web - Phase 1 Architecture

## 🚀 New Backend Implementation

This repository now includes a **production-ready TypeScript/NestJS backend** (Phase 1 of the roadmap), providing a modern foundation for the Gramps Web genealogy platform.

## Project Structure

```
gramps-web/
├── backend/              # NEW: NestJS TypeScript backend (Phase 1)
│   ├── src/             # Source code
│   ├── prisma/          # Database schema & migrations
│   ├── test/            # Integration tests
│   └── README.md        # Backend documentation
├── src/                 # Frontend source (Web Components)
├── mock-server/         # Legacy mock API (being replaced)
├── ROADMAP.md           # 13-phase evolution plan
└── PHASE1_IMPLEMENTATION.md  # Implementation details
```

## Quick Start

### Backend (New - Phase 1)

```bash
cd backend

# Install dependencies
npm install

# Setup database
npm run prisma:generate
npm run migrate:dev
npm run seed

# Start development server
npm run start:dev
```

Backend runs on http://localhost:5555
- API docs: http://localhost:5555/api/docs
- Login: `owner` / `owner`

See [backend/README.md](backend/README.md) for detailed documentation.

### Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run start
```

Frontend runs on http://localhost:8001

## What's New in Phase 1?

✅ **Modern TypeScript Backend**
- NestJS framework for scalability
- Full type safety from database to API

✅ **Production Database**
- Prisma ORM with SQLite (PostgreSQL-ready)
- Comprehensive genealogy schema
- Proper migrations & seeding

✅ **Secure Authentication**
- JWT tokens with refresh capability
- 5-tier RBAC (Owner, Editor, Contributor, Member, Guest)
- Bcrypt password hashing

✅ **API Documentation**
- Auto-generated Swagger/OpenAPI docs
- Interactive API testing
- Complete request/response schemas

✅ **Enterprise Security**
- Helmet security headers
- CORS configuration
- Input validation
- SQL injection protection

See [PHASE1_IMPLEMENTATION.md](PHASE1_IMPLEMENTATION.md) for complete details.

## Architecture Highlights

### Backend Modules

- **Auth**: JWT authentication with passport
- **Users**: User management with RBAC
- **People**: Person records (CRUD complete)
- **Families**: Family relationships
- **Events**: Life events
- **Places**: Geographic locations
- **Sources & Citations**: Research documentation
- **Repositories**: Archives & libraries
- **Media**: Photos & documents
- **Notes**: Research notes

### Database Schema

Designed for genealogy with proper relationships:
- People ↔ Families (parents/children/spouses)
- Events → Places
- Citations → Sources → Repositories
- Media attached to any entity
- Notes for research tracking

### API Endpoints

All endpoints under `/api/`:
- `POST /api/token/` - Login
- `GET /api/people/` - List people (with search & pagination)
- `GET /api/people/:handle` - Get person details
- `PUT /api/people/:handle` - Update person
- Similar patterns for all entity types

## Development Workflow

1. **Backend Development** (`/backend`)
   - Modify Prisma schema
   - Run migrations: `npm run migrate:dev`
   - Update NestJS services/controllers
   - Test: `npm run test:e2e`

2. **Frontend Development** (root)
   - Web Components in `/src`
   - Connect to backend at `http://localhost:5555/api`

## Testing

### Backend Tests
```bash
cd backend
npm run test        # Unit tests
npm run test:e2e    # Integration tests
npm run test:cov    # Coverage report
```

### Frontend Tests
```bash
npm test
```

## Deployment

### Development
```bash
# Backend
cd backend && npm run start:dev

# Frontend
npm run start
```

### Production

**Backend**:
```bash
cd backend
npm run build
npm run start:prod
```

Or use Docker:
```bash
cd backend
docker build -t gramps-backend .
docker run -p 5555:5555 --env-file .env gramps-backend
```

**Frontend**:
```bash
npm run build
# Serve /dist directory
```

## Migration Guide

### From Mock Server to Phase 1 Backend

The new backend maintains API compatibility with the mock server:

**Same Endpoints**:
- `POST /api/token/` - Login
- `GET /api/people/` - List people
- `GET /api/users/` - List users

**Enhanced Features**:
- ✅ Real database (was JSON file)
- ✅ Proper authentication (was mock tokens)
- ✅ Type safety (was vanilla JS)
- ✅ Validation (was minimal)
- ✅ Documentation (Swagger)

**Configuration**:
Update frontend API URL if needed (default: `http://localhost:5555/api`)

## Environment Variables

### Backend (`.env`)
```env
DATABASE_URL="file:../gramps.db"
JWT_SECRET="your-secret-key"
PORT=5555
CORS_ORIGIN="http://localhost:8001"
```

### Frontend
See main README for frontend configuration.

## Roadmap Progress

- ✅ **Phase 1**: Backend foundation (COMPLETE)
- ⏳ **Phase 2**: Core genealogy CRUD with validation
- 🔜 **Phase 3**: GEDCOM import/export
- 🔜 **Phase 4**: Media management
- ...and 9 more phases!

See [ROADMAP.md](ROADMAP.md) for the complete vision.

## Contributing

### Backend
- Follow NestJS conventions
- Add DTOs for all endpoints
- Write tests for new features
- Update Swagger docs

### Frontend
- Web Components (Lit)
- Material Design
- Connect to `/api` endpoints

See the original README below for frontend contribution guidelines.

## Documentation

- [Backend Documentation](backend/README.md) - NestJS backend guide
- [Phase 1 Implementation](PHASE1_IMPLEMENTATION.md) - Detailed architecture
- [Roadmap](ROADMAP.md) - Long-term vision
- [API Docs](http://localhost:5555/api/docs) - Interactive Swagger docs (when running)

---

## Original Frontend README

