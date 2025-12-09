# Gramps Web Backend

TypeScript/NestJS backend for Gramps Web genealogy platform.

## Phase 1 Implementation

This backend implements Phase 1 of the Gramps Web Evolution Roadmap:

- ✅ **Backend Migration**: Full TypeScript/NestJS architecture
- ✅ **Database Layer**: SQLite with Prisma ORM (easily swappable to PostgreSQL)
- ✅ **API Standardization**: OpenAPI/Swagger specification at `/api/docs`
- ✅ **Authentication & Security**: JWT-based auth with RBAC

## Features

- **Type-Safe**: Full TypeScript implementation
- **Database**: Prisma ORM with SQLite (production-ready for PostgreSQL)
- **Authentication**: JWT tokens with refresh token support
- **Authorization**: Role-based access control (Owner, Editor, Contributor, Member)
- **API Documentation**: Automatic Swagger/OpenAPI docs
- **Security**: bcrypt password hashing, token expiration, session management
- **Audit Logging**: Track all changes with user attribution
- **Validation**: Automatic request/response validation

## Quick Start

### Installation

```bash
cd backend
npm install
```

### Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### Development

```bash
# Development mode with hot reload
npm run start:dev

# Production build
npm run build

# Start production server
npm run start:prod
```

### Seed Database

The database will auto-seed with an initial owner user:
- Username: `owner`
- Password: `owner`
- Role: `owner`

**Important**: Change this password in production!

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:5555/api/docs
- **API Base**: http://localhost:5555/api

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL="file:./gramps.db"  # SQLite
# DATABASE_URL="postgresql://user:password@localhost:5432/gramps"  # PostgreSQL

# JWT Configuration
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-in-production"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=5555
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:8001"
```

## Role-Based Access Control

The system supports four role levels:

1. **Owner** (Level 4): Full system access, user management
2. **Editor** (Level 3): Edit all data, manage content
3. **Contributor** (Level 2): Add and edit own contributions
4. **Member** (Level 1): Read-only access

## API Endpoints

### Authentication
- `POST /api/token` - Login
- `POST /api/token/refresh` - Refresh access token

### Users
- `GET /api/users` - List all users (Editor+)
- `POST /api/users` - Create user (Owner only)
- `PUT /api/users/:id` - Update user (Owner only)
- `DELETE /api/users/:id` - Delete user (Owner only)

### Genealogy Resources
- `GET /api/people` - List people
- `POST /api/people` - Create person (Contributor+)
- `PUT /api/people/:handle` - Update person (Contributor+)
- `DELETE /api/people/:handle` - Delete person (Editor+)

Similar endpoints exist for:
- `/api/families`
- `/api/events`
- `/api/places`
- `/api/media`
- `/api/repositories`
- `/api/sources`
- `/api/notes`

### Settings
- `GET /api/metadata` - Get system metadata (Public)
- `GET /api/trees/-` - Get tree settings
- `PUT /api/trees/-` - Update tree settings (Editor+)

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Database Migration to PostgreSQL

To switch from SQLite to PostgreSQL:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/gramps"
```

3. Run migrations:
```bash
npm run prisma:migrate
```

## Security Considerations

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with short expiration (15 minutes)
- ✅ Refresh tokens stored in database (7 day expiration)
- ✅ Token revocation support
- ✅ Role-based authorization
- ✅ Request validation and sanitization
- ✅ CORS protection
- ⚠️ Change default JWT secrets in production
- ⚠️ Use HTTPS in production
- ⚠️ Implement rate limiting for production

## Architecture

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── auth/                  # Authentication & authorization
│   │   ├── guards/            # Auth guards (JWT, RBAC)
│   │   ├── strategies/        # Passport strategies
│   │   └── decorators/        # Auth decorators
│   ├── users/                 # User management
│   ├── people/                # People CRUD
│   ├── families/              # Family CRUD
│   ├── events/                # Event CRUD
│   ├── places/                # Place CRUD
│   ├── media/                 # Media CRUD
│   ├── repositories/          # Repository CRUD
│   ├── sources/               # Source CRUD
│   ├── notes/                 # Note CRUD
│   ├── metadata/              # System metadata
│   ├── tree-settings/         # Tree settings
│   ├── prisma/                # Prisma service
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application bootstrap
├── .env                       # Environment variables
├── .env.example               # Environment template
└── package.json               # Dependencies
```

## Future Expandability

This implementation is designed for future expansion:

- ✅ Database schema supports JSON fields for complex nested data
- ✅ Audit logging infrastructure in place
- ✅ Easily swappable database (SQLite → PostgreSQL)
- ✅ Modular architecture for adding new features
- ✅ API versioning ready
- ✅ OpenAPI spec for client code generation
- ✅ Extensible authentication (ready for OIDC, OAuth2)

## License

AGPL-3.0
