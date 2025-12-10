# Gramps Web Management Scripts

This directory contains utility scripts for managing your Gramps Web deployment.

## Scripts

### monitor.sh

Performance monitoring script that displays:
- Service status
- Resource usage (CPU, memory, network)
- Database size
- Redis cache statistics and hit rates
- Backend health
- API response times
- Disk usage
- Recent errors

**Usage:**
```bash
./scripts/monitor.sh
```

**Requirements:**
- Docker and Docker Compose
- `jq` (optional, for JSON formatting)
- Services running via `docker-compose.prod.yml`

### backup.sh

Automated backup script that creates:
- PostgreSQL database dump (compressed)
- Docker volumes backup (uploads)
- Backup manifest with restoration instructions

**Usage:**
```bash
# Create backup with default name (timestamp)
./scripts/backup.sh

# Create backup with custom name
./scripts/backup.sh my-backup-name
```

**Features:**
- Automatic old backup cleanup (keeps last 30 days)
- Compressed backups to save space
- Manifest file for easy restoration
- Size calculations

**Backup Location:** `./backups/`

### restore.sh

Database restoration script that:
- Stops all services
- Restores database from backup
- Restores uploaded files
- Restarts all services
- Verifies restoration

**Usage:**
```bash
# List available backups
./scripts/restore.sh

# Restore specific backup
./scripts/restore.sh backup_20231209_120000
```

**⚠️ Warning:** This will replace all current data!

## Automation

### Schedule Automatic Backups

Add to crontab for daily backups at 2 AM:

```bash
crontab -e

# Add this line:
0 2 * * * /path/to/gramps-web/scripts/backup.sh >> /var/log/gramps-backup.log 2>&1
```

### Systemd Timer (Alternative)

Create `/etc/systemd/system/gramps-backup.timer`:

```ini
[Unit]
Description=Gramps Web Daily Backup
Requires=gramps-backup.service

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

Create `/etc/systemd/system/gramps-backup.service`:

```ini
[Unit]
Description=Gramps Web Backup Service

[Service]
Type=oneshot
User=your-user
WorkingDirectory=/path/to/gramps-web
ExecStart=/path/to/gramps-web/scripts/backup.sh
```

Enable timer:
```bash
sudo systemctl enable gramps-backup.timer
sudo systemctl start gramps-backup.timer
```

## Common Tasks

### Check Application Health

```bash
./scripts/monitor.sh
```

### Create Backup Before Updates

```bash
./scripts/backup.sh pre-update-$(date +%Y%m%d)
```

### Restore from Backup

```bash
# List backups
./scripts/restore.sh

# Restore
./scripts/restore.sh backup_name
```

### Monitor Cache Performance

```bash
# Full monitoring
./scripts/monitor.sh

# Redis stats only
docker-compose -f docker-compose.prod.yml exec redis redis-cli INFO stats
```

### Clean Up Old Backups Manually

```bash
# Remove backups older than 30 days
find ./backups -name "backup_*" -mtime +30 -delete
```

## Troubleshooting

### monitor.sh shows "Services not running"

Ensure services are started:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### backup.sh fails with permission error

Ensure script is executable and you have Docker permissions:
```bash
chmod +x scripts/backup.sh
sudo usermod -aG docker $USER
newgrp docker
```

### restore.sh hangs

Check Docker logs:
```bash
docker-compose -f docker-compose.prod.yml logs -f database
```

## Security Notes

- Backup files contain sensitive data - store securely
- Encrypt backups before transferring to external storage
- Limit access to backup directory (chmod 700)
- Never commit backups to version control

## External Backup Storage

### AWS S3 Example

```bash
#!/bin/bash
# After running backup.sh, upload to S3
BACKUP_NAME=$(ls -t backups/*.sql.gz | head -1)
aws s3 cp "$BACKUP_NAME" s3://your-bucket/gramps-backups/
```

### Google Cloud Storage Example

```bash
#!/bin/bash
# After running backup.sh, upload to GCS
BACKUP_NAME=$(ls -t backups/*.sql.gz | head -1)
gsutil cp "$BACKUP_NAME" gs://your-bucket/gramps-backups/
```

## Additional Resources

- [Phase 11 Implementation Guide](../PHASE11_IMPLEMENTATION.md)
- [Deployment Guide](../DEPLOYMENT_GUIDE.md)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
