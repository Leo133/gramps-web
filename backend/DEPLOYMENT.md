# Deployment Guide - Gramps Web Backend (Phase 1)

This guide covers deploying the new TypeScript/NestJS backend with SQLite/PostgreSQL database.

## Quick Start (Development)

### Prerequisites
- Node.js 20 or later
- npm 9 or later

### Setup

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Initialize Database**
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. **Start Development Server**
```bash
npm run start:dev
```

The backend will be available at:
- API: http://localhost:5555/api
- Swagger Docs: http://localhost:5555/api/docs

### Default Credentials
- Username: `owner`
- Password: `owner`

**⚠️ IMPORTANT: Change this password immediately in production!**

## Docker Deployment

### Using Docker Compose

1. **Build and Start**
```bash
docker-compose -f docker-compose.backend.yml up -d
```

2. **View Logs**
```bash
docker-compose -f docker-compose.backend.yml logs -f backend
```

3. **Stop Services**
```bash
docker-compose -f docker-compose.backend.yml down
```

### Standalone Docker

```bash
cd backend
docker build -t gramps-web-backend .
docker run -p 5555:5555 -v $(pwd)/data:/app/prisma gramps-web-backend
```

## Production Deployment

### Environment Variables

Create a `.env` file with production values:

```bash
# Database - SQLite
DATABASE_URL="file:./gramps.db"

# OR PostgreSQL
# DATABASE_URL="postgresql://user:password@localhost:5432/gramps"

# JWT Secrets (CHANGE THESE!)
JWT_SECRET="your-very-secure-secret-key-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-very-secure-refresh-secret-min-32-chars"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=5555
NODE_ENV=production

# CORS (your frontend URL)
CORS_ORIGIN="https://your-domain.com"
```

### PostgreSQL Setup

1. **Update Prisma Schema**

Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **Update DATABASE_URL**
```bash
DATABASE_URL="postgresql://username:password@host:5432/database"
```

3. **Run Migrations**
```bash
npm run prisma:migrate
npm run prisma:seed
```

### Security Checklist

- [ ] Change default JWT secrets
- [ ] Change default owner password
- [ ] Use HTTPS in production
- [ ] Set secure CORS_ORIGIN
- [ ] Enable rate limiting (recommended)
- [ ] Set up database backups
- [ ] Use PostgreSQL in production (recommended)
- [ ] Implement monitoring and logging
- [ ] Set up SSL/TLS for database connections
- [ ] Use environment-specific .env files

### Reverse Proxy (Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5555;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start backend
pm2 start npm --name "gramps-backend" -- run start:prod

# Save process list
pm2 save

# Setup startup script
pm2 startup
```

## Database Maintenance

### Backup SQLite

```bash
# Backup
cp backend/prisma/gramps.db backend/prisma/gramps.db.backup

# Restore
cp backend/prisma/gramps.db.backup backend/prisma/gramps.db
```

### Backup PostgreSQL

```bash
# Backup
pg_dump -U username -h host -d gramps > gramps_backup.sql

# Restore
psql -U username -h host -d gramps < gramps_backup.sql
```

### Database Migrations

```bash
# Create new migration
npm run prisma:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Deploy migrations in production
npx prisma migrate deploy
```

## Monitoring

### Health Check Endpoint

```bash
curl http://localhost:5555/api/metadata
```

### Logs

Development:
```bash
npm run start:dev
```

Production:
```bash
# PM2
pm2 logs gramps-backend

# Docker
docker logs -f gramps-backend
```

## Troubleshooting

### Database Connection Issues

1. Check DATABASE_URL is correct
2. Ensure database server is running
3. Verify network connectivity
4. Check file permissions (SQLite)

### Authentication Issues

1. Verify JWT secrets are set
2. Check token expiration times
3. Ensure passwords are hashed correctly
4. Verify user exists in database

### Migration Issues

```bash
# Reset and recreate database
npx prisma migrate reset
npm run prisma:seed
```

## Performance Optimization

### Database Indexing

Prisma automatically creates indexes for `@unique` and `@id` fields. For custom indexes, modify the schema:

```prisma
model Person {
  // ... fields
  @@index([firstName, surname])
}
```

### Caching (Future Enhancement)

For production, consider adding Redis caching:
- Cache JWT token validation
- Cache frequently accessed resources
- Implement rate limiting

### Connection Pooling

PostgreSQL supports connection pooling via `DATABASE_URL`:

```
postgresql://user:password@host:5432/db?connection_limit=10&pool_timeout=20
```

## Scaling

### Horizontal Scaling

The backend is stateless and can be horizontally scaled:

1. Use PostgreSQL (not SQLite)
2. Deploy multiple backend instances
3. Use load balancer (Nginx, HAProxy)
4. Share JWT secrets across instances
5. Use external session store if needed

### Load Balancer Example

```nginx
upstream backend {
    server backend1:5555;
    server backend2:5555;
    server backend3:5555;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

## Migration from Old Mock Server

### Data Migration

The new backend uses a different schema. To migrate data:

1. Export from old mock-server (`db.json`)
2. Transform data to match new schema
3. Import via API or direct database insertion

### API Compatibility

The new backend maintains compatibility with the existing API endpoints:
- `POST /api/token` - Login
- `POST /api/token/refresh` - Refresh token
- `GET /api/metadata` - System metadata
- `GET /api/people` - List people
- etc.

### Frontend Changes

Minimal changes required:
- Update API URL in frontend config
- JWT token format remains compatible
- Response formats maintained

## Support

For issues or questions:
1. Check the [GitHub Issues](https://github.com/gramps-project/gramps-web/issues)
2. Review the [API Documentation](http://localhost:5555/api/docs)
3. Consult the [main README](../README.md)
