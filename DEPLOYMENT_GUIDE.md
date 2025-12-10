# Deployment Guide - Phase 11

This guide covers deploying Gramps Web using the optimized Docker infrastructure implemented in Phase 11.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Service Management](#service-management)
6. [Scaling](#scaling)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Backup & Recovery](#backup--recovery)
9. [Troubleshooting](#troubleshooting)

## Quick Start

Deploy the complete Gramps Web stack in 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/gramps-project/gramps-web.git
cd gramps-web

# 2. Configure environment
cp .env.production.example .env
nano .env  # Edit with your settings

# 3. Start services
docker-compose -f docker-compose.prod.yml up -d

# 4. Initialize database
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:migrate
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:seed

# 5. Access your application
# Frontend: http://localhost
# API: http://localhost/api
```

## Prerequisites

### System Requirements

**Minimum:**
- CPU: 2 cores
- RAM: 4 GB
- Disk: 20 GB
- OS: Linux, macOS, or Windows with WSL2

**Recommended:**
- CPU: 4+ cores
- RAM: 8+ GB
- Disk: 50+ GB SSD
- OS: Ubuntu 22.04 LTS or similar

### Software Requirements

1. **Docker** (20.10 or later)
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

2. **Docker Compose** (v2.0 or later)
   ```bash
   # Usually included with Docker Desktop
   docker compose version
   ```

3. **Git**
   ```bash
   sudo apt-get install git  # Ubuntu/Debian
   brew install git          # macOS
   ```

## Production Deployment

### Step-by-Step Guide

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y git docker.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### 2. Clone Repository

```bash
# Clone to a production directory
sudo mkdir -p /opt/gramps-web
sudo chown $USER:$USER /opt/gramps-web
cd /opt/gramps-web
git clone https://github.com/gramps-project/gramps-web.git .
```

#### 3. Configure Environment

```bash
# Copy and edit environment file
cp .env.production.example .env

# Required: Generate secure secrets
# Use a password generator for these values
nano .env
```

Example `.env`:
```env
# Database
DB_PASSWORD=your-very-secure-database-password-here

# JWT Secrets (minimum 32 characters each)
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4

# CORS (Your domain)
CORS_ORIGIN=https://genealogy.yourdomain.com

# Port
PORT=80
```

#### 4. Start Services

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

#### 5. Initialize Database

```bash
# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:migrate

# Seed with initial data
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:seed
```

#### 6. Verify Deployment

```bash
# Check all services are healthy
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Test endpoints
curl http://localhost/api/metadata
```

### Reverse Proxy Setup (Production)

For production, use a reverse proxy with SSL/TLS:

#### Nginx Configuration

```nginx
# /etc/nginx/sites-available/gramps-web
server {
    listen 80;
    server_name genealogy.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name genealogy.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/genealogy.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/genealogy.yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:80;
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

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/gramps-web /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Let's Encrypt SSL

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d genealogy.yourdomain.com

# Auto-renewal is configured automatically
```

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_PASSWORD` | PostgreSQL password | `secure-password-123` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `abc...xyz` |
| `JWT_REFRESH_SECRET` | JWT refresh secret (min 32 chars) | `xyz...abc` |
| `CORS_ORIGIN` | Frontend URL | `https://example.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Frontend port | `80` |
| `DATABASE_URL` | External database URL | (uses Docker service) |
| `REDIS_URL` | External Redis URL | (uses Docker service) |

## Service Management

### Common Commands

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restart a specific service
docker-compose -f docker-compose.prod.yml restart backend

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Execute command in container
docker-compose -f docker-compose.prod.yml exec backend sh

# Update to latest version
git pull
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Systemd Service (Auto-start on boot)

Create `/etc/systemd/system/gramps-web.service`:

```ini
[Unit]
Description=Gramps Web Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/gramps-web
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable gramps-web.service
sudo systemctl start gramps-web.service
sudo systemctl status gramps-web.service
```

## Scaling

### Horizontal Scaling

#### 1. Update Docker Compose

Edit `docker-compose.prod.yml`:

```yaml
backend:
  deploy:
    replicas: 3  # Run 3 backend instances
```

#### 2. Add Load Balancer

Create `docker-compose.lb.yml`:

```yaml
services:
  loadbalancer:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
```

Load balancer config:
```nginx
upstream backend {
    server backend:5555;
    # Add more backend instances as needed
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

### Vertical Scaling

Increase resources in `docker-compose.prod.yml`:

```yaml
backend:
  deploy:
    resources:
      limits:
        memory: 2G
        cpus: '2'
      reservations:
        memory: 1G
        cpus: '1'
```

## Monitoring & Maintenance

### Health Checks

All services include health checks:

```bash
# Check health status
docker-compose -f docker-compose.prod.yml ps

# Detailed inspection
docker inspect gramps-backend | grep -A 10 Health
```

### Log Management

#### Log Rotation

Configure Docker log rotation in `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

### Resource Monitoring

```bash
# Monitor resource usage
docker stats

# Container-specific stats
docker stats gramps-backend gramps-frontend
```

## Backup & Recovery

### Database Backup

#### Automated Backup Script

Create `/opt/gramps-web/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/gramps-web/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
docker-compose -f docker-compose.prod.yml exec -T database \
  pg_dump -U gramps gramps | gzip > "$BACKUP_DIR/db_${DATE}.sql.gz"

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: db_${DATE}.sql.gz"
```

Make executable:
```bash
chmod +x /opt/gramps-web/backup.sh
```

#### Schedule with Cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/gramps-web/backup.sh >> /var/log/gramps-backup.log 2>&1
```

### Volume Backup

```bash
# Backup all volumes
docker run --rm \
  -v gramps_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/postgres_data.tar.gz /data
```

### Restore Database

```bash
# From SQL backup
zcat backups/db_20231209_120000.sql.gz | \
  docker-compose -f docker-compose.prod.yml exec -T database \
  psql -U gramps gramps
```

## Troubleshooting

### Service Not Starting

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check configuration
docker-compose -f docker-compose.prod.yml config

# Verify environment variables
docker-compose -f docker-compose.prod.yml exec backend env
```

### Database Connection Issues

```bash
# Test database connection
docker-compose -f docker-compose.prod.yml exec backend \
  npx prisma db execute --stdin < /dev/null

# Check database logs
docker-compose -f docker-compose.prod.yml logs database
```

### Redis Connection Issues

```bash
# Test Redis
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping

# Check Redis logs
docker-compose -f docker-compose.prod.yml logs redis
```

### Out of Memory

```bash
# Check memory usage
docker stats

# Increase limits in docker-compose.prod.yml
# Or add swap space on host
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Performance Issues

```bash
# Check slow queries (PostgreSQL)
docker-compose -f docker-compose.prod.yml exec database \
  psql -U gramps -c "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# Check cache hit rate (Redis)
docker-compose -f docker-compose.prod.yml exec redis \
  redis-cli INFO stats | grep cache
```

## Security Best Practices

- ✅ Use strong, unique passwords
- ✅ Enable HTTPS with valid certificates
- ✅ Keep software up to date
- ✅ Regular backups
- ✅ Monitor logs for suspicious activity
- ✅ Use firewall to restrict access
- ✅ Enable Docker security features
- ✅ Regular security audits

## Support

For additional help:
- Documentation: See PHASE11_IMPLEMENTATION.md
- GitHub Issues: https://github.com/gramps-project/gramps-web/issues
- Community: Check project README for community links
