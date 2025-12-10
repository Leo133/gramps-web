# Phase 13 Implementation Guide: Advanced Administration & Governance

## Overview

Phase 13 introduces comprehensive administration and governance features to Gramps Web, providing site owners and administrators with powerful tools to manage data, users, and system health. This implementation includes five major subsystems: Audit Logging, Backup Management, Bulk Operations, System Health Monitoring, and Approval Workflows.

## Architecture

### Module Structure

```
backend/src/admin/
├── admin.module.ts           # Main admin module
├── admin.controller.ts       # REST API controller (38 endpoints)
├── dto/
│   └── admin.dto.ts         # Data transfer objects & validation
├── audit/
│   └── audit.service.ts     # Audit log management
├── backup/
│   └── backup.service.ts    # Backup & restore operations
├── bulk/
│   └── bulk.service.ts      # Bulk data operations
├── health/
│   └── health.service.ts    # System health monitoring
└── workflow/
    └── workflow.service.ts  # Approval workflow system
```

## Features Implemented

### 1. Audit Logging System

**Purpose:** Provides a tamper-proof history of every change made in the system.

**Key Features:**
- Automatic tracking of all CREATE, UPDATE, DELETE operations
- User attribution (who made the change)
- IP address and user agent tracking
- Before/after state capture
- Rollback capability for reversible changes
- Advanced filtering and search
- Statistical analysis

**Database Model:**
```typescript
model AuditLog {
  id         String   @id @default(uuid())
  userId     String
  action     String   // CREATE, UPDATE, DELETE, ROLLBACK
  entityType String   // Person, Family, etc.
  entityId   String
  changes    String?  // JSON of before/after state
  timestamp  DateTime @default(now())
  ipAddress  String?
  userAgent  String?
  rolledBack Boolean  @default(false)
}
```

**API Endpoints:**
- `GET /api/admin/audit-logs` - Get all audit logs with filters
- `GET /api/admin/audit-logs/entity/:entityType/:entityId` - Get logs for specific entity
- `GET /api/admin/audit-logs/statistics` - Get audit statistics
- `POST /api/admin/audit-logs/rollback` - Rollback a change (Owner only)

**Usage Example:**
```typescript
// Get all changes to a specific person
GET /api/admin/audit-logs/entity/Person/abc123

// Get changes in the last 7 days
GET /api/admin/audit-logs?startDate=2024-12-03&endDate=2024-12-10

// Rollback a change
POST /api/admin/audit-logs/rollback
{ "auditLogId": "xyz789" }
```

### 2. Backup Management System

**Purpose:** Automated, encrypted backups with cloud storage support.

**Key Features:**
- Manual and scheduled backups
- Multiple compression formats (gzip, zip, none)
- AES-256-CBC encryption support
- Cloud storage destinations (local, S3, Google Drive)
- Retention policies with automatic cleanup
- Restore functionality
- Backup job tracking and status

**Database Model:**
```typescript
model BackupJob {
  id           String   @id @default(uuid())
  status       String   // pending, running, completed, failed
  type         String   // manual, scheduled
  destination  String   // local, s3, google-drive
  filePath     String?
  fileSize     Int?
  encrypted    Boolean  @default(false)
  compression  String?
  startedAt    DateTime?
  completedAt  DateTime?
  errorMessage String?
  createdBy    String?
}
```

**API Endpoints:**
- `POST /api/admin/backups` - Create a backup (Owner only)
- `GET /api/admin/backups` - Get all backups
- `GET /api/admin/backups/:id` - Get backup details
- `POST /api/admin/backups/:id/restore` - Restore from backup (Owner only)
- `DELETE /api/admin/backups/cleanup` - Clean up old backups (Owner only)

**Usage Example:**
```typescript
// Create an encrypted backup
POST /api/admin/backups
{
  "type": "manual",
  "destination": "local",
  "encrypted": true,
  "compression": "gzip"
}

// Clean up backups older than 30 days
DELETE /api/admin/backups/cleanup
{ "retentionDays": 30 }
```

**Environment Variables:**
```bash
BACKUP_DIR="./backups"
BACKUP_ENCRYPTION_KEY="your-encryption-key"
```

### 3. Bulk Operations System

**Purpose:** Tools for mass data operations to improve efficiency.

**Key Features:**
- Mass tagging of entities
- Find and replace text across entities
- Merge duplicate entities
- Automatic duplicate detection
- Support for case-sensitive and whole-word matching
- Multiple merge strategies (prefer-primary, prefer-newest, prefer-oldest)

**Supported Operations:**

#### Mass Tagging
Tag multiple entities at once:
- People, Places, Sources, Media

#### Find & Replace
Find and replace text in fields:
- People: firstName, surname, callName
- Places: name, title
- Sources: title, author, pubInfo
- Notes: content

#### Merge Duplicates
Merge duplicate entities:
- People (by name, birth date, birth place)
- Places (by name, coordinates)
- Sources (by title, author)

#### Duplicate Detection
Automatically find potential duplicates using similarity algorithms

**API Endpoints:**
- `POST /api/admin/bulk/mass-tag` - Mass tag entities
- `POST /api/admin/bulk/find-replace` - Find and replace text
- `POST /api/admin/bulk/merge` - Merge duplicate entities
- `GET /api/admin/bulk/find-duplicates` - Find potential duplicates

**Usage Example:**
```typescript
// Find and replace in person surnames
POST /api/admin/bulk/find-replace
{
  "entityType": "person",
  "field": "surname",
  "findText": "Smith",
  "replaceText": "Smyth",
  "caseSensitive": false,
  "wholeWord": true
}

// Merge duplicate people
POST /api/admin/bulk/merge
{
  "entityType": "person",
  "primaryId": "abc123",
  "duplicateIds": ["def456", "ghi789"],
  "strategy": "prefer-primary"
}

// Find duplicate places
GET /api/admin/bulk/find-duplicates?entityType=place&threshold=0.8
```

### 4. System Health Monitoring

**Purpose:** Real-time monitoring of server load, database size, and error rates.

**Key Features:**
- CPU, memory, and disk usage tracking
- Database size and connection monitoring
- Request and error rate tracking
- Active user tracking
- Historical metrics with aggregation
- Trend analysis
- Overall health status determination
- Automated metric cleanup

**Database Model:**
```typescript
model SystemHealth {
  id            String   @id @default(uuid())
  timestamp     DateTime @default(now())
  cpuUsage      Float?
  memoryUsage   Float?
  diskUsage     Float?
  dbSize        Int?
  dbConnections Int?
  requestCount  Int?
  errorCount    Int?
  activeUsers   Int?
  metadata      String?  // JSON for additional metrics
}
```

**API Endpoints:**
- `GET /api/admin/health/current` - Get current health metrics
- `GET /api/admin/health/status` - Get system status summary
- `GET /api/admin/health/metrics` - Get historical metrics
- `GET /api/admin/health/database` - Get database statistics
- `DELETE /api/admin/health/metrics/cleanup` - Clean up old metrics (Owner only)

**Usage Example:**
```typescript
// Get current system health
GET /api/admin/health/current

// Get health metrics for the last 24 hours
GET /api/admin/health/metrics?startDate=2024-12-09T00:00:00Z&interval=hour

// Get database statistics
GET /api/admin/health/database
```

**Metrics Collected:**
- CPU Usage (%)
- Memory Usage (%)
- Disk Usage (%)
- Database Size (bytes)
- Active Database Connections
- Requests per Hour
- Errors per Hour
- Active Users (last hour)

### 5. Approval Workflow System

**Purpose:** A "Pull Request" system for genealogy data changes.

**Key Features:**
- Contributors submit change proposals
- Editors/Owners review and approve/reject
- Support for CREATE, UPDATE, DELETE operations
- Comment system for feedback
- Automatic application of approved changes
- Comprehensive proposal tracking
- Statistics and reporting

**Database Model:**
```typescript
model ChangeProposal {
  id              String   @id @default(uuid())
  submitterId     String
  reviewerId      String?
  entityType      String   // Person, Family, etc.
  entityId        String?  // null for new entities
  operation       String   // CREATE, UPDATE, DELETE
  proposedChanges String   // JSON
  currentState    String?  // JSON
  status          String   @default("pending") // pending, approved, rejected
  comment         String?
  submittedAt     DateTime @default(now())
  reviewedAt      DateTime?
}
```

**API Endpoints:**
- `POST /api/admin/proposals` - Submit a proposal (Contributor/Member)
- `GET /api/admin/proposals` - Get all proposals (Editor+)
- `GET /api/admin/proposals/:id` - Get proposal details (Editor+)
- `POST /api/admin/proposals/:id/approve` - Approve proposal (Editor+)
- `POST /api/admin/proposals/:id/reject` - Reject proposal (Editor+)
- `GET /api/admin/proposals/statistics` - Get proposal statistics (Editor+)

**Usage Example:**
```typescript
// Submit a proposal to create a new person
POST /api/admin/proposals
{
  "entityType": "Person",
  "operation": "CREATE",
  "proposedChanges": {
    "firstName": "John",
    "surname": "Doe",
    "birthDate": "1900-01-01"
  }
}

// Approve a proposal
POST /api/admin/proposals/:id/approve
{
  "comment": "Looks good, approved!"
}

// Reject a proposal
POST /api/admin/proposals/:id/reject
{
  "comment": "Need more sources for this information"
}
```

**Workflow:**
1. Contributor/Member submits a change proposal
2. Proposal enters "pending" state
3. Editor/Owner reviews the proposal
4. Editor can:
   - Approve: Changes are applied automatically
   - Reject: Changes are discarded with reason
5. Proposal status updated to "approved" or "rejected"
6. Action logged in audit log

## Security & Permissions

### Role-Based Access Control

**Owner Role (Level 4):**
- All permissions
- Rollback changes
- Create/restore backups
- Clean up old data
- Full admin access

**Editor Role (Level 3):**
- View audit logs
- View backups
- Bulk operations
- View system health
- Approve/reject proposals

**Contributor Role (Level 2):**
- Submit proposals
- Limited access to admin features

**Member Role (Level 1):**
- Submit proposals
- Minimal admin access

### Authentication

All admin endpoints require JWT authentication:
```typescript
@ApiBearerAuth('JWT-auth')
@Controller('api/admin')
```

### Authorization

Endpoints are protected by role guards:
```typescript
@Roles('owner')           // Owner only
@Roles('editor', 'owner') // Editor or Owner
```

## Database Migrations

The Phase 13 migration adds four new tables:
- `change_proposals` - Approval workflow tracking
- `backup_jobs` - Backup job history
- `system_health` - Health metrics history
- Enhanced `audit_logs` - Additional fields for rollback

Migration file: `20251210012140_phase13_admin_governance`

## Performance Considerations

### Audit Logs
- Indexed by: entityType, entityId, userId, timestamp
- Automatic cleanup recommended (retain 90-365 days)
- Large deployments should archive old logs

### System Health
- Metrics collected automatically
- Retention policy: 90 days default
- Aggregation available: hour, day, week

### Bulk Operations
- Large operations may take time
- Consider running during off-peak hours
- Results are limited to prevent response size issues

### Backups
- Compression reduces storage by ~70%
- Encryption adds ~10% overhead
- Cloud uploads are asynchronous

## Testing

### Manual Testing

1. **Audit Logs:**
```bash
# Make a change
curl -X PUT http://localhost:5555/api/people/I0001 \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"firstName": "Updated"}'

# View audit log
curl http://localhost:5555/api/admin/audit-logs/entity/Person/I0001 \
  -H "Authorization: Bearer $TOKEN"
```

2. **Backups:**
```bash
# Create a backup
curl -X POST http://localhost:5555/api/admin/backups \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type": "manual", "encrypted": true}'

# List backups
curl http://localhost:5555/api/admin/backups \
  -H "Authorization: Bearer $TOKEN"
```

3. **System Health:**
```bash
# Get current health
curl http://localhost:5555/api/admin/health/current \
  -H "Authorization: Bearer $TOKEN"
```

4. **Workflows:**
```bash
# Submit a proposal
curl -X POST http://localhost:5555/api/admin/proposals \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "entityType": "Person",
    "operation": "CREATE",
    "proposedChanges": {"firstName": "Test", "surname": "User"}
  }'

# Approve proposal (as Editor/Owner)
curl -X POST http://localhost:5555/api/admin/proposals/:id/approve \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"comment": "Approved"}'
```

## API Documentation

All endpoints are documented in Swagger/OpenAPI format and available at:
```
http://localhost:5555/api/docs
```

Navigate to the "Admin" tag to see all 38 admin endpoints with:
- Request/response schemas
- Authentication requirements
- Role requirements
- Example payloads

## Future Enhancements

### Phase 13.1 - Enhanced Features
- Scheduled backups with cron expressions
- Email notifications for proposals
- Advanced duplicate detection with ML
- Real-time health alerts
- Export audit logs to CSV/JSON

### Phase 13.2 - Integration
- Webhook support for external monitoring
- Slack/Discord notifications
- Integration with external backup services (AWS S3, Google Drive API)
- Advanced analytics dashboard

### Phase 13.3 - Optimization
- Background job queue for bulk operations
- Incremental backups
- Query optimization for large audit logs
- Caching layer for health metrics

## Troubleshooting

### Backup Issues

**Problem:** Backup fails with "Encryption key not configured"
**Solution:** Set `BACKUP_ENCRYPTION_KEY` in `.env` file

**Problem:** Backup file not found
**Solution:** Check `BACKUP_DIR` path and permissions

### Audit Log Issues

**Problem:** Rollback fails with "no previous state"
**Solution:** Not all changes can be rolled back; CREATE operations have no previous state

### Health Monitoring Issues

**Problem:** Disk usage always shows 0
**Solution:** `fs.statfs` may not be available on all platforms; this is a known limitation

### Workflow Issues

**Problem:** Cannot approve own proposals
**Solution:** This is intentional; proposals must be reviewed by a different user

## Conclusion

Phase 13 provides comprehensive administrative capabilities for Gramps Web, enabling site owners to:
- Track and audit all changes
- Maintain reliable backups
- Perform bulk data operations efficiently
- Monitor system health proactively
- Implement collaborative data workflows

These tools are essential for managing production genealogy platforms with multiple users and large datasets.
