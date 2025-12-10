#!/bin/bash

# Automated Backup Script
# Phase 11: Performance, DevOps & Deployment
# 
# This script creates backups of the database and uploaded files
# Usage: ./scripts/backup.sh [backup-name]

set -e

COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME=${1:-"backup_${TIMESTAMP}"}

# Create backup directory
mkdir -p $BACKUP_DIR

echo "=== Gramps Web Backup Script ==="
echo "Backup: $BACKUP_NAME"
echo ""

# Backup database
echo "1. Backing up PostgreSQL database..."
docker-compose -f $COMPOSE_FILE exec -T database \
  pg_dump -U gramps gramps | gzip > "${BACKUP_DIR}/${BACKUP_NAME}.sql.gz"
echo "   Database backed up to: ${BACKUP_DIR}/${BACKUP_NAME}.sql.gz"
echo ""

# Backup Redis (if needed)
echo "2. Backing up Redis data..."
docker-compose -f $COMPOSE_FILE exec -T redis redis-cli SAVE 2>/dev/null || echo "   Redis backup skipped (optional)"
echo ""

# Backup volumes
echo "3. Backing up Docker volumes..."

# Backup uploads
docker run --rm \
  -v gramps_backend_uploads:/data \
  -v "$(pwd)/${BACKUP_DIR}:/backup" \
  alpine tar czf "/backup/${BACKUP_NAME}_uploads.tar.gz" /data 2>/dev/null && \
  echo "   Uploads backed up to: ${BACKUP_DIR}/${BACKUP_NAME}_uploads.tar.gz" || \
  echo "   No uploads to backup"

echo ""

# Create manifest
echo "4. Creating backup manifest..."
cat > "${BACKUP_DIR}/${BACKUP_NAME}_manifest.txt" <<EOF
Gramps Web Backup Manifest
==========================

Backup Name: ${BACKUP_NAME}
Date: $(date)
Hostname: $(hostname)

Files:
- ${BACKUP_NAME}.sql.gz (PostgreSQL database)
- ${BACKUP_NAME}_uploads.tar.gz (Uploaded files)

Database Size: $(du -h "${BACKUP_DIR}/${BACKUP_NAME}.sql.gz" | cut -f1)
Uploads Size: $(du -h "${BACKUP_DIR}/${BACKUP_NAME}_uploads.tar.gz" 2>/dev/null | cut -f1 || echo "N/A")

To restore this backup:
1. Stop all services: docker-compose -f docker-compose.prod.yml down
2. Restore database: zcat ${BACKUP_NAME}.sql.gz | docker-compose -f docker-compose.prod.yml exec -T database psql -U gramps gramps
3. Restore uploads: docker run --rm -v gramps_backend_uploads:/data -v \$(pwd)/backups:/backup alpine tar xzf /backup/${BACKUP_NAME}_uploads.tar.gz -C /
4. Start services: docker-compose -f docker-compose.prod.yml up -d
EOF

echo "   Manifest created: ${BACKUP_DIR}/${BACKUP_NAME}_manifest.txt"
echo ""

# Calculate total size
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}/${BACKUP_NAME}"* | awk '{sum+=$1} END {print sum}')
echo "5. Backup Summary:"
echo "   Total backup size: $(du -sh "${BACKUP_DIR}" | cut -f1)"
echo "   Backup location: ${BACKUP_DIR}/${BACKUP_NAME}*"
echo ""

# Cleanup old backups (keep last 30 days)
echo "6. Cleaning up old backups (keeping last 30 days)..."
find "${BACKUP_DIR}" -name "backup_*.sql.gz" -mtime +30 -delete 2>/dev/null || true
find "${BACKUP_DIR}" -name "backup_*_uploads.tar.gz" -mtime +30 -delete 2>/dev/null || true
find "${BACKUP_DIR}" -name "backup_*_manifest.txt" -mtime +30 -delete 2>/dev/null || true
echo "   Cleanup complete"
echo ""

echo "=== Backup Complete ==="
echo ""
echo "To restore this backup later, see: ${BACKUP_DIR}/${BACKUP_NAME}_manifest.txt"
