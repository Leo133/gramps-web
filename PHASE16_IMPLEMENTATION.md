# Phase 16: Publishing, Sharing & External Integration - Implementation Guide

This document describes the complete implementation of Phase 16 features for Gramps Web, focusing on publishing, sharing, and external integration capabilities.

## Overview

Phase 16 enables users to share their family history with the world through multiple channels:

- **Static Site Generation** - Create standalone family websites
- **PDF & Print Publishing** - Generate printable family books and reports
- **Public Sharing** - Share specific branches with secure, privacy-filtered links
- **Embeddable Widgets** - Embed interactive charts in external websites
- **API & Integration** - Third-party access via API keys and webhooks
- **Social & Export** - Share to social media and export to calendars

## Architecture

### Backend Structure

```
backend/src/publishing/
├── publishing.module.ts           # Main publishing module
├── publishing.controller.ts       # REST API endpoints
├── dto/
│   ├── create-site.dto.ts         # Site generation DTOs
│   ├── share-link.dto.ts          # Sharing DTOs
│   ├── api-key.dto.ts             # API key management DTOs
│   └── export.dto.ts              # Export DTOs
└── services/
    ├── site-generator.service.ts  # Static site generation
    ├── pdf-generator.service.ts   # PDF/book generation
    ├── share-link.service.ts      # Public sharing management
    ├── embed.service.ts           # Embeddable widget generation
    ├── api-key.service.ts         # API key management
    ├── webhook.service.ts         # Webhook management
    └── social.service.ts          # Social sharing features
```

### Database Models

```prisma
// Published Site Configuration
model PublishedSite {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  name        String
  subdomain   String   @unique
  customDomain String? @map("custom_domain")
  theme       String   @default("classic")
  settings    String?  // JSON configuration
  status      String   @default("draft") // draft, published, archived
  lastPublished DateTime? @map("last_published")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@map("published_sites")
  @@index([userId])
  @@index([subdomain])
}

// Share Links for public access
model ShareLink {
  id            String   @id @default(uuid())
  userId        String   @map("user_id")
  token         String   @unique
  name          String
  entityType    String   @map("entity_type") // Person, Family, Branch
  entityId      String   @map("entity_id")
  privacyLevel  String   @default("public") @map("privacy_level") // all, living, deceased, public
  maxGenerations Int?    @map("max_generations")
  expiresAt     DateTime? @map("expires_at")
  password      String?  // Optional password protection
  viewCount     Int      @default(0) @map("view_count")
  maxViews      Int?     @map("max_views")
  enabled       Boolean  @default(true)
  createdAt     DateTime @default(now()) @map("created_at")
  
  @@map("share_links")
  @@index([token])
  @@index([userId])
}

// API Keys for external integrations
model ApiKey {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  name        String
  key         String   @unique
  keyHash     String   @map("key_hash")
  permissions String   // JSON array of permissions
  rateLimit   Int      @default(1000) @map("rate_limit") // requests per hour
  lastUsed    DateTime? @map("last_used")
  expiresAt   DateTime? @map("expires_at")
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now()) @map("created_at")
  
  @@map("api_keys")
  @@index([key])
  @@index([userId])
}

// Webhooks for event notifications
model Webhook {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  name        String
  url         String
  events      String   // JSON array of event types
  secret      String   // For signature verification
  enabled     Boolean  @default(true)
  lastTriggered DateTime? @map("last_triggered")
  failCount   Int      @default(0) @map("fail_count")
  createdAt   DateTime @default(now()) @map("created_at")
  
  @@map("webhooks")
  @@index([userId])
}

// Export Jobs for PDF/book generation
model ExportJob {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  type        String   // pdf-book, pdf-report, photo-book, calendar
  format      String   // ahnentafel, descendant, narrative, custom
  status      String   @default("pending") // pending, processing, completed, failed
  settings    String   // JSON configuration
  filePath    String?  @map("file_path")
  fileSize    Int?     @map("file_size")
  errorMessage String? @map("error_message")
  startedAt   DateTime? @map("started_at")
  completedAt DateTime? @map("completed_at")
  createdAt   DateTime @default(now()) @map("created_at")
  
  @@map("export_jobs")
  @@index([userId])
  @@index([status])
}
```

## API Endpoints

All endpoints are prefixed with `/api/publishing` and require JWT authentication unless otherwise noted.

### Static Site Generation

#### Create/Update Site Configuration
```
POST /api/publishing/sites
Body: {
  "name": "Smith Family History",
  "subdomain": "smith-family",
  "theme": "modern",
  "settings": {
    "homePerson": "p0001",
    "includedBranches": ["p0001", "p0002"],
    "showPhotos": true,
    "showTimelines": true,
    "showMaps": true,
    "headerImage": "media/header.jpg",
    "footerText": "© 2024 Smith Family"
  }
}
```

#### Get User's Sites
```
GET /api/publishing/sites
Response: [
  {
    "id": "site123",
    "name": "Smith Family History",
    "subdomain": "smith-family",
    "status": "published",
    "lastPublished": "2024-12-10T00:00:00Z"
  }
]
```

#### Publish Site
```
POST /api/publishing/sites/:id/publish
Response: {
  "status": "published",
  "url": "https://smith-family.gramps.io",
  "publishedAt": "2024-12-10T00:00:00Z"
}
```

#### Get Available Themes
```
GET /api/publishing/themes
Response: [
  {
    "id": "classic",
    "name": "Classic Heritage",
    "description": "Traditional family history design",
    "preview": "/themes/classic/preview.jpg"
  },
  {
    "id": "modern",
    "name": "Modern Minimal",
    "description": "Clean, contemporary design",
    "preview": "/themes/modern/preview.jpg"
  }
]
```

### PDF & Book Generation

#### Create Export Job
```
POST /api/publishing/exports
Body: {
  "type": "pdf-book",
  "format": "narrative",
  "settings": {
    "rootPerson": "p0001",
    "generations": 5,
    "direction": "descendants",
    "includePhotos": true,
    "includeTimelines": true,
    "includeMaps": false,
    "pageSize": "letter",
    "orientation": "portrait"
  }
}
```

#### Get Export Status
```
GET /api/publishing/exports/:id
Response: {
  "id": "export123",
  "status": "completed",
  "filePath": "/exports/book-123.pdf",
  "fileSize": 2456789
}
```

#### Download Export
```
GET /api/publishing/exports/:id/download
Response: Binary PDF file
```

### Public Sharing

#### Create Share Link
```
POST /api/publishing/shares
Body: {
  "name": "Share with Cousin Bob",
  "entityType": "Person",
  "entityId": "p0001",
  "privacyLevel": "deceased",
  "maxGenerations": 4,
  "expiresAt": "2025-01-01T00:00:00Z",
  "password": "optional-password"
}
```

#### Get Share Links
```
GET /api/publishing/shares
Response: [
  {
    "id": "share123",
    "name": "Share with Cousin Bob",
    "token": "abc123def456",
    "viewCount": 12,
    "enabled": true
  }
]
```

#### Access Shared Content (Public - No Auth Required)
```
GET /api/public/share/:token
Query: ?password=optional-password
Response: {
  "person": { ... },
  "ancestors": [ ... ],
  "descendants": [ ... ]
}
```

#### Disable Share Link
```
DELETE /api/publishing/shares/:id
```

### Embeddable Widgets

#### Generate Embed Code
```
POST /api/publishing/embed
Body: {
  "type": "tree",
  "entityId": "p0001",
  "options": {
    "generations": 3,
    "direction": "both",
    "width": "100%",
    "height": "600px",
    "theme": "light"
  }
}
Response: {
  "embedCode": "<iframe src='...' width='100%' height='600px'></iframe>",
  "scriptCode": "<script src='...'></script><div id='gramps-tree' data-person='p0001'></div>"
}
```

#### Available Widget Types
- `tree` - Interactive family tree
- `pedigree` - Pedigree chart
- `fan` - Fan chart
- `timeline` - Person/family timeline
- `photos` - Photo gallery
- `map` - Geographic map of events

### API Key Management

#### Create API Key
```
POST /api/publishing/api-keys
Body: {
  "name": "Mobile App",
  "permissions": ["read:people", "read:families", "read:media"],
  "rateLimit": 5000,
  "expiresAt": "2025-12-31T00:00:00Z"
}
Response: {
  "id": "key123",
  "key": "gw_live_abc123...",  // Only shown once!
  "name": "Mobile App",
  "permissions": ["read:people", "read:families", "read:media"]
}
```

#### List API Keys
```
GET /api/publishing/api-keys
Response: [
  {
    "id": "key123",
    "name": "Mobile App",
    "keyPrefix": "gw_live_abc...",  // Partial key for identification
    "lastUsed": "2024-12-10T00:00:00Z",
    "enabled": true
  }
]
```

#### Revoke API Key
```
DELETE /api/publishing/api-keys/:id
```

### Webhooks

#### Create Webhook
```
POST /api/publishing/webhooks
Body: {
  "name": "Notify on changes",
  "url": "https://example.com/webhook",
  "events": ["person.created", "person.updated", "family.created"]
}
Response: {
  "id": "webhook123",
  "secret": "whsec_abc123..."  // For signature verification
}
```

#### List Webhooks
```
GET /api/publishing/webhooks
```

#### Delete Webhook
```
DELETE /api/publishing/webhooks/:id
```

### Social Sharing

#### Generate Social Card
```
GET /api/publishing/social-card/:entityType/:entityId
Response: {
  "title": "John Smith (1850-1920)",
  "description": "View the family tree of John Smith",
  "image": "https://gramps.io/cards/p0001.png",
  "url": "https://gramps.io/person/p0001"
}
```

#### Export to Calendar
```
GET /api/publishing/calendar/export
Query: ?format=ical&scope=birthdays,anniversaries
Response: iCal file with events
```

## Frontend Components

### Publishing Dashboard

```javascript
// src/components/GrampsjsPublishingDashboard.js
class GrampsjsPublishingDashboard extends LitElement {
  // Overview of all publishing features
  // - Sites list with publish status
  // - Recent exports
  // - Active share links
  // - API key summary
}
```

### Site Builder

```javascript
// src/components/GrampsjsSiteBuilder.js
class GrampsjsSiteBuilder extends LitElement {
  // Visual site configuration
  // - Theme selector
  // - Content settings
  // - Preview panel
  // - Publish button
}
```

### Share Dialog

```javascript
// src/components/GrampsjsShareDialog.js
class GrampsjsShareDialog extends LitElement {
  // Create share links
  // - Privacy level selector
  // - Expiration settings
  // - Password protection
  // - Copy link button
}
```

### Embed Generator

```javascript
// src/components/GrampsjsEmbedGenerator.js
class GrampsjsEmbedGenerator extends LitElement {
  // Generate embed codes
  // - Widget type selector
  // - Options configuration
  // - Preview
  // - Copy code buttons
}
```

### API Keys Manager

```javascript
// src/components/GrampsjsApiKeysManager.js
class GrampsjsApiKeysManager extends LitElement {
  // Manage API keys
  // - Create new keys
  // - Permission selector
  // - Revoke keys
  // - Usage statistics
}
```

### Export Wizard

```javascript
// src/components/GrampsjsExportWizard.js
class GrampsjsExportWizard extends LitElement {
  // Multi-step export wizard
  // - Format selection
  // - Options configuration
  // - Preview
  // - Download
}
```

## Security Considerations

### Public Share Links

1. **Token Security**: Share tokens are cryptographically random 32-character strings
2. **Privacy Filtering**: Living persons are automatically filtered based on privacy level
3. **Rate Limiting**: Public endpoints are rate-limited to prevent abuse
4. **Expiration**: Links can have expiration dates and max view counts
5. **Password Protection**: Optional password protection for sensitive shares
6. **Audit Logging**: All public accesses are logged

### API Keys

1. **Key Hashing**: API keys are hashed (bcrypt) before storage
2. **Prefix Visibility**: Only key prefix is shown after creation
3. **Permissions**: Fine-grained permission system
4. **Rate Limiting**: Configurable rate limits per key
5. **Expiration**: Keys can have expiration dates
6. **Revocation**: Immediate revocation capability

### Webhooks

1. **Signature Verification**: HMAC-SHA256 signatures for payload verification
2. **Retry Logic**: Automatic retries with exponential backoff
3. **Failure Handling**: Keys disabled after repeated failures
4. **HTTPS Required**: Only HTTPS URLs accepted

## Implementation Status

### Backend (NestJS)

- [x] Publishing module structure
- [x] Database migrations for new models
- [x] Site generation service
- [x] PDF generation service
- [x] Share link service
- [x] Embed widget service
- [x] API key service
- [x] Webhook service
- [x] Social sharing service

### Mock Server

- [x] Site management endpoints
- [x] Export endpoints
- [x] Share link endpoints
- [x] Public access endpoint
- [x] Embed generation endpoint
- [x] API key endpoints
- [x] Webhook endpoints
- [x] Calendar export endpoint

### Frontend

- [x] Publishing dashboard
- [x] Site builder component
- [x] Share dialog component
- [x] Embed generator component
- [x] API keys manager component
- [x] Export wizard component

## Usage Examples

### Create and Publish a Family Site

```javascript
// 1. Create site configuration
const site = await fetch('/api/publishing/sites', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Smith Family Heritage',
    subdomain: 'smith-heritage',
    theme: 'classic',
    settings: {
      homePerson: 'p0001',
      showPhotos: true,
      showTimelines: true
    }
  })
});

// 2. Preview before publishing
window.open(`/preview/${site.id}`);

// 3. Publish
await fetch(`/api/publishing/sites/${site.id}/publish`, {
  method: 'POST'
});
// Site is now live at https://smith-heritage.gramps.io
```

### Share a Branch with a Cousin

```javascript
// Create a privacy-filtered share link
const share = await fetch('/api/publishing/shares', {
  method: 'POST',
  body: JSON.stringify({
    name: 'For Cousin Mary',
    entityType: 'Person',
    entityId: 'p0001',
    privacyLevel: 'deceased',  // Only show deceased persons
    maxGenerations: 5,
    expiresAt: '2025-06-01'
  })
});

// Send the link to your cousin
const shareUrl = `https://gramps.io/share/${share.token}`;
```

### Generate a Family Book PDF

```javascript
// Start export job
const job = await fetch('/api/publishing/exports', {
  method: 'POST',
  body: JSON.stringify({
    type: 'pdf-book',
    format: 'narrative',
    settings: {
      rootPerson: 'p0001',
      generations: 5,
      includePhotos: true,
      pageSize: 'letter'
    }
  })
});

// Poll for completion
let status = 'processing';
while (status === 'processing') {
  await new Promise(r => setTimeout(r, 5000));
  const check = await fetch(`/api/publishing/exports/${job.id}`);
  status = check.status;
}

// Download the PDF
window.open(`/api/publishing/exports/${job.id}/download`);
```

### Embed a Tree Widget on Your Blog

```javascript
// Generate embed code
const embed = await fetch('/api/publishing/embed', {
  method: 'POST',
  body: JSON.stringify({
    type: 'tree',
    entityId: 'p0001',
    options: {
      generations: 3,
      width: '100%',
      height: '600px'
    }
  })
});

// Copy and paste the iframe code to your blog
console.log(embed.embedCode);
// <iframe src="https://gramps.io/embed/tree/abc123" width="100%" height="600px"></iframe>
```

## Testing Checklist

### Unit Tests

- [ ] SiteGeneratorService
- [ ] PdfGeneratorService
- [ ] ShareLinkService
- [ ] EmbedService
- [ ] ApiKeyService
- [ ] WebhookService
- [ ] SocialService

### Integration Tests

- [ ] Site creation and publishing flow
- [ ] Export job lifecycle
- [ ] Share link access with privacy filtering
- [ ] API key authentication
- [ ] Webhook delivery

### E2E Tests

- [ ] Full publishing workflow
- [ ] Public share access
- [ ] Embed widget rendering

## Future Enhancements

### Phase 16.1
- [ ] Multi-language site generation
- [ ] Custom CSS injection for sites
- [ ] Scheduled publishing
- [ ] Version history for sites

### Phase 16.2
- [ ] Print-on-demand integration (Blurb, Lulu)
- [ ] Cloud hosting (Netlify, Vercel) deployment
- [ ] Custom domain with SSL
- [ ] Analytics dashboard

### Phase 16.3
- [ ] Collaborative publishing (multiple editors)
- [ ] A/B testing for themes
- [ ] SEO optimization tools
- [ ] Subscription/paywall for exclusive content

---

**Phase 16 Status:** 🚧 IN PROGRESS

*Implementation started: December 24, 2024*
