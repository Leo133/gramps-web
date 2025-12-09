# Gramps Web Backend

TypeScript/NestJS backend for Gramps Web genealogy platform implementing Phase 1 architecture.

## Features

- **TypeScript/NestJS Framework**: Modern, scalable backend architecture
- **Prisma ORM**: Type-safe database access with SQLite
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: Fine-grained permissions (OWNER, EDITOR, CONTRIBUTOR, MEMBER, GUEST)
- **OpenAPI/Swagger Documentation**: Auto-generated API docs at `/api/docs`
- **Comprehensive Security**: Helmet, CORS, compression
- **RESTful API**: Standard CRUD operations for all genealogy entities

## Architecture

This backend implements Phase 1 of the Gramps Web Evolution Roadmap:

### Database Schema (Prisma + SQLite)

Core genealogy models:
- **Person**: Individual records with names, dates, places
- **Family**: Family relationships (parents/children/spouses)
- **Event**: Life events (birth, death, marriage, etc.)
- **Place**: Geographic locations with coordinates
- **Source**: Source documents
- **Citation**: Citations linking sources to facts
- **Repository**: Archives and libraries
- **Media**: Photos, documents, audio
- **Note**: Research notes
- **User**: User accounts with roles

### API Endpoints

All endpoints are prefixed with `/api/`:

- `POST /api/token/` - Login (get JWT tokens)
- `POST /api/token/refresh/` - Refresh access token
- `GET /api/users/` - List users
- `GET /api/people/` - List people (with pagination, search)
- `GET /api/people/:handle` - Get person by handle
- `PUT /api/people/:handle` - Update person
- `DELETE /api/people/:handle` - Delete person
- Similar endpoints for families, events, places, sources, etc.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run migrate:dev

# Seed initial data
npm run seed
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="file:../gramps.db"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1h"
PORT=5555
CORS_ORIGIN="http://localhost:8001"
```

### Development

```bash
# Start development server (with hot reload)
npm run start:dev

# View Prisma Studio (database GUI)
npm run prisma:studio
```

The server will start on `http://localhost:5555`.

API documentation is available at `http://localhost:5555/api/docs`.

### Production

```bash
# Build
npm run build

# Start production server
npm run start:prod
```

## Default Credentials

- Username: `owner`
- Password: `owner`

**⚠️ Change these credentials in production!**

## API Testing

### Login Example

```bash
curl -X POST http://localhost:5555/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"owner","password":"owner"}'
```

### Get People Example

```bash
curl http://localhost:5555/api/people/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── auth/              # Authentication module
│   ├── users/             # User management
│   ├── people/            # Person records
│   ├── families/          # Family relationships
│   ├── events/            # Life events
│   ├── places/            # Geographic places
│   ├── sources/           # Source documents
│   ├── citations/         # Citations
│   ├── repositories/      # Repositories
│   ├── media/             # Media objects
│   ├── notes/             # Notes
│   ├── metadata/          # System metadata
│   ├── common/
│   │   └── prisma/        # Prisma service
│   ├── app.module.ts      # Root module
│   └── main.ts            # Entry point
├── package.json
└── tsconfig.json
```

## Security Features

- **JWT Authentication**: Stateless authentication with refresh tokens
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access**: 5-tier permission system
- **Helmet**: Security headers
- **CORS**: Configurable origin
- **Validation**: Request DTOs with class-validator
- **SQL Injection Protection**: Prisma parameterized queries

## Future Expandability

This Phase 1 implementation provides a solid foundation for:

- **Phase 2**: Enhanced CRUD with validation logic
- **Phase 3**: GEDCOM import/export
- **Phase 4**: Media management
- **Phase 5**: Advanced visualizations
- **Phase 6**: Geospatial features
- **Phase 7**: Timeline analysis
- **Phase 8**: Search engine integration
- **Phase 9**: Real-time collaboration
- **Phase 10+**: UI/UX, performance, AI features

The architecture supports:
- Easy schema migrations with Prisma
- Module-based organization for feature additions
- Type safety throughout the stack
- Swagger documentation auto-generation
- Horizontal scaling capabilities

## Contributing

Follow NestJS best practices:
- Use DTOs for all inputs
- Add Swagger decorators
- Write unit tests
- Follow TypeScript strict mode

## License

AGPL-3.0
