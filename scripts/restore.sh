#!/bin/bash

# Database Restore Script
# Phase 11: Performance, DevOps & Deployment
# 
# This script restores a backup of the database and uploaded files
# Usage: ./scripts/restore.sh <backup-name>

set -e

COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"

if [ -z "$1" ]; then
  echo "Usage: $0 <backup-name>"
  echo ""
  echo "Available backups:"
  ls -1 "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | sed 's/.sql.gz//' | xargs -n1 basename || echo "No backups found"
  exit 1
fi

BACKUP_NAME=$1

echo "=== Gramps Web Restore Script ==="
echo "Restoring backup: $BACKUP_NAME"
echo ""

# Check if backup exists
if [ ! -f "${BACKUP_DIR}/${BACKUP_NAME}.sql.gz" ]; then
  echo "Error: Backup not found: ${BACKUP_DIR}/${BACKUP_NAME}.sql.gz"
  exit 1
fi

# Warning
echo "WARNING: This will replace all current data!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read -r

# Stop services
echo "1. Stopping services..."
docker-compose -f $COMPOSE_FILE down
echo "   Services stopped"
echo ""

# Start only database
echo "2. Starting database service..."
docker-compose -f $COMPOSE_FILE up -d database
sleep 5
echo "   Database started"
echo ""

# Restore database
echo "3. Restoring database..."
zcat "${BACKUP_DIR}/${BACKUP_NAME}.sql.gz" | \
  docker-compose -f $COMPOSE_FILE exec -T database \
  psql -U gramps gramps
echo "   Database restored"
echo ""

# Restore uploads if backup exists
if [ -f "${BACKUP_DIR}/${BACKUP_NAME}_uploads.tar.gz" ]; then
  echo "4. Restoring uploaded files..."
  docker run --rm \
    -v gramps_backend_uploads:/data \
    -v "$(pwd)/${BACKUP_DIR}:/backup" \
    alpine tar xzf "/backup/${BACKUP_NAME}_uploads.tar.gz" -C /
  echo "   Uploads restored"
else
  echo "4. No uploads backup found, skipping..."
fi
echo ""

# Start all services
echo "5. Starting all services..."
docker-compose -f $COMPOSE_FILE up -d
sleep 10
echo "   Services started"
echo ""

# Verify
echo "6. Verifying restoration..."
docker-compose -f $COMPOSE_FILE ps
echo ""

# Check database
echo "7. Database status:"
docker-compose -f $COMPOSE_FILE exec -T database \
  psql -U gramps -c "SELECT COUNT(*) as person_count FROM \"Person\";" 2>/dev/null || \
  echo "   Unable to query database"
echo ""

echo "=== Restore Complete ==="
echo ""
echo "Application should be available at: http://localhost"
echo ""
echo "Check logs with: docker-compose -f $COMPOSE_FILE logs -f"
